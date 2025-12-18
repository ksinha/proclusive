import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendIncompleteApplicationReminder } from '@/lib/email/sendgrid';

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

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify the user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the application with profile
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select(`
        *,
        profile:profiles!applications_user_id_fkey(email, full_name)
      `)
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('[SendSingleReminder] Error fetching application:', appError);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Get incomplete steps for personalized email
    const incompleteSteps = getIncompleteSteps(application);

    console.log(`[SendSingleReminder] Sending reminder to ${application.profile.email}`);

    // Send the reminder email
    const emailSent = await sendIncompleteApplicationReminder(
      {
        email: application.profile.email,
        fullName: application.profile.full_name,
      },
      incompleteSteps
    );

    if (emailSent) {
      // Update reminder tracking
      await supabase
        .from('applications')
        .update({
          last_reminder_sent: new Date().toISOString(),
          reminder_count: (application.reminder_count || 0) + 1,
        })
        .eq('id', applicationId);

      return NextResponse.json({
        success: true,
        message: 'Reminder sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[SendSingleReminder] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
