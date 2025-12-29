import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendIncompleteApplicationReminder } from '@/lib/email/sendgrid';

// Lazily create Supabase admin client to avoid build-time errors
function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Reminder schedule in days
const REMINDER_SCHEDULE = {
  first: 3,      // First reminder at 3 days
  second: 7,     // Second reminder at 7 days
  recurring: 7,  // Then every 7 days
  maxDays: 30,   // Stop after 30 days
};

interface ApplicationWithProfile {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_reminder_sent: string | null;
  reminder_count: number;
  profile: {
    email: string;
    full_name: string;
  };
}

function getIncompleteSteps(app: any): string[] {
  const steps: string[] = [];

  // Check verification points - if all are 'not_submitted', they haven't done documents
  const docPoints = [
    'point_1_business_reg',
    'point_2_prof_license',
    'point_3_liability_ins',
    'point_4_workers_comp',
    'point_5_contact_verify',
  ];

  const allDocsNotSubmitted = docPoints.every(
    (p) => app[p] === 'not_submitted'
  );

  if (allDocsNotSubmitted) {
    steps.push('Upload verification documents');
  }

  if (!app.tos_accepted) {
    steps.push('Accept Terms of Service');
  }

  if (!app.privacy_accepted) {
    steps.push('Accept Privacy Policy');
  }

  // If no specific steps found, give generic message
  if (steps.length === 0) {
    steps.push('Complete and submit your application');
  }

  return steps;
}

function shouldSendReminder(
  createdAt: Date,
  lastReminderSent: Date | null,
  reminderCount: number
): boolean {
  const now = new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Stop after max days
  if (daysSinceCreation > REMINDER_SCHEDULE.maxDays) {
    return false;
  }

  // First reminder at 3 days
  if (reminderCount === 0 && daysSinceCreation >= REMINDER_SCHEDULE.first) {
    return true;
  }

  // Second reminder at 7 days
  if (reminderCount === 1 && daysSinceCreation >= REMINDER_SCHEDULE.second) {
    return true;
  }

  // Recurring reminders every 7 days after the last one
  if (reminderCount >= 2 && lastReminderSent) {
    const daysSinceLastReminder = Math.floor(
      (now.getTime() - lastReminderSent.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastReminder >= REMINDER_SCHEDULE.recurring;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('[ApplicationReminders] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[ApplicationReminders] Starting reminder check...');

    const supabaseAdmin = getSupabaseAdmin();

    // Get all pending applications with their profiles
    const { data: applications, error: fetchError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        profile:profiles!applications_user_id_fkey(email, full_name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('[ApplicationReminders] Error fetching applications:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    console.log(`[ApplicationReminders] Found ${applications?.length || 0} pending applications`);

    const results = {
      checked: 0,
      sent: 0,
      skipped: 0,
      errors: 0,
    };

    for (const app of (applications || []) as ApplicationWithProfile[]) {
      results.checked++;

      const createdAt = new Date(app.created_at);
      const lastReminderSent = app.last_reminder_sent
        ? new Date(app.last_reminder_sent)
        : null;
      const reminderCount = app.reminder_count || 0;

      if (!shouldSendReminder(createdAt, lastReminderSent, reminderCount)) {
        results.skipped++;
        continue;
      }

      // Get incomplete steps for personalized email
      const incompleteSteps = getIncompleteSteps(app);

      console.log(`[ApplicationReminders] Sending reminder to ${app.profile.email} (count: ${reminderCount + 1})`);

      try {
        const emailSent = await sendIncompleteApplicationReminder(
          {
            email: app.profile.email,
            fullName: app.profile.full_name,
          },
          incompleteSteps
        );

        if (emailSent) {
          // Update reminder tracking
          await supabaseAdmin
            .from('applications')
            .update({
              last_reminder_sent: new Date().toISOString(),
              reminder_count: reminderCount + 1,
            })
            .eq('id', app.id);

          results.sent++;
        } else {
          results.errors++;
        }
      } catch (emailError) {
        console.error(`[ApplicationReminders] Error sending to ${app.profile.email}:`, emailError);
        results.errors++;
      }
    }

    console.log('[ApplicationReminders] Complete:', results);

    return NextResponse.json({
      success: true,
      results,
      message: `Sent ${results.sent} reminders, skipped ${results.skipped}, ${results.errors} errors`,
    });
  } catch (error) {
    console.error('[ApplicationReminders] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Also support GET for easy manual testing
export async function GET(request: NextRequest) {
  return POST(request);
}
