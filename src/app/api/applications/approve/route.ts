import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendApplicationApprovedNotification } from '@/lib/email/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const { applicationId, badgeLevel } = await request.json();

    if (!applicationId || !badgeLevel) {
      return NextResponse.json(
        { error: 'Application ID and badge level are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!adminProfile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
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
      console.error('Error fetching application:', appError);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Send approval email
    const emailSent = await sendApplicationApprovedNotification(
      {
        email: application.profile.email,
        fullName: application.profile.full_name,
      },
      badgeLevel
    );

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? 'Approval notification sent successfully'
        : 'Application approved but email notification failed'
    });
  } catch (error) {
    console.error('Error in approve application API:', error);
    return NextResponse.json(
      { error: 'Failed to send approval notification' },
      { status: 500 }
    );
  }
}
