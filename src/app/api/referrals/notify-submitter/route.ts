import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReferralSubmittedConfirmation } from '@/lib/email/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const { referralId } = await request.json();

    if (!referralId) {
      return NextResponse.json(
        { error: 'Referral ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the referral with submitter profile
    const { data: referral, error: refError } = await supabase
      .from('referrals')
      .select(`
        *,
        submitter:profiles!referrals_submitted_by_fkey(
          id,
          email,
          full_name,
          company_name
        )
      `)
      .eq('id', referralId)
      .single();

    if (refError || !referral) {
      console.error('[NotifySubmitter] Error fetching referral:', refError);
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Generate a reference ID for the email
    const referenceId = `REF-${referral.id.slice(0, 8).toUpperCase()}`;

    // Send confirmation email to submitter
    const emailSent = await sendReferralSubmittedConfirmation(
      {
        email: referral.submitter.email,
        fullName: referral.submitter.full_name,
        companyName: referral.submitter.company_name,
      },
      {
        referralId: referenceId,
        clientName: referral.client_name,
        clientCompany: referral.client_company,
        projectType: referral.project_type,
        valueRange: referral.value_range,
        location: referral.location,
        timeline: referral.timeline,
      }
    );

    return NextResponse.json({
      success: true,
      emailSent,
      message: emailSent ? 'Confirmation email sent to submitter' : 'Failed to send confirmation email',
    });
  } catch (error) {
    console.error('[NotifySubmitter] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
