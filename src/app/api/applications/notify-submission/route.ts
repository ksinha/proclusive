import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendApplicationSubmittedNotification, sendNewApplicationNotification } from '@/lib/email/sendgrid';

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

    // Send confirmation email to applicant
    const applicantEmailSent = await sendApplicationSubmittedNotification({
      email: application.profile.email,
      fullName: application.profile.full_name,
    });

    // Send notification email to admin
    const adminEmailSent = await sendNewApplicationNotification(
      {
        email: application.profile.email,
        fullName: application.profile.full_name,
      },
      applicationId
    );

    return NextResponse.json({
      success: true,
      applicantEmailSent,
      adminEmailSent,
      message: `Emails sent - Applicant: ${applicantEmailSent}, Admin: ${adminEmailSent}`
    });
  } catch (error) {
    console.error('Error in notify-submission API:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}
