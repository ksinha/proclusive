import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendApplicationRejectionNotification } from '@/lib/email/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const { applicationId, adminNotes } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
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

    // Update application status to rejected
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: 'rejected',
        admin_notes: adminNotes || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'rejected_application',
      entity_type: 'application',
      entity_id: applicationId,
      details: { admin_notes: adminNotes },
    });

    // Build verification points array for email
    const verificationPoints = [
      { key: 'point_1_business_reg', status: application.point_1_business_reg },
      { key: 'point_2_prof_license', status: application.point_2_prof_license },
      { key: 'point_3_liability_ins', status: application.point_3_liability_ins },
      { key: 'point_4_workers_comp', status: application.point_4_workers_comp },
      { key: 'point_5_contact_verify', status: application.point_5_contact_verify },
      { key: 'point_6_portfolio', status: application.point_6_portfolio },
      { key: 'point_7_references', status: application.point_7_references },
      { key: 'point_8_certifications', status: application.point_8_certifications },
      { key: 'point_9_financial', status: application.point_9_financial },
      { key: 'point_10_legal_record', status: application.point_10_legal_record },
      { key: 'point_11_operating_history', status: application.point_11_operating_history },
      { key: 'point_12_industry_awards', status: application.point_12_industry_awards },
      { key: 'point_13_satisfaction', status: application.point_13_satisfaction },
      { key: 'point_14_network_contrib', status: application.point_14_network_contrib },
      { key: 'point_15_enterprise', status: application.point_15_enterprise },
    ];

    // Send rejection email
    const emailSent = await sendApplicationRejectionNotification(
      {
        email: application.profile.email,
        fullName: application.profile.full_name,
      },
      verificationPoints,
      adminNotes || ''
    );

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent
        ? 'Application rejected and notification sent'
        : 'Application rejected (email notification failed)'
    });
  } catch (error) {
    console.error('Error in reject application API:', error);
    return NextResponse.json(
      { error: 'Failed to process rejection' },
      { status: 500 }
    );
  }
}
