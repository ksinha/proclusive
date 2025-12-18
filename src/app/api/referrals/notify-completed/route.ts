import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReferralCompleted } from '@/lib/email/sendgrid';

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

    // Get the referral with submitter and matched member profiles
    const { data: referral, error: refError } = await supabase
      .from('referrals')
      .select(`
        *,
        submitter:profiles!referrals_submitted_by_fkey(
          id,
          email,
          full_name,
          company_name
        ),
        matched_member:profiles!referrals_matched_to_fkey(
          id,
          email,
          full_name,
          company_name
        )
      `)
      .eq('id', referralId)
      .single();

    if (refError || !referral) {
      console.error('[NotifyCompleted] Error fetching referral:', refError);
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const referralData = {
      referralId: referral.id,
      referenceNumber: referral.reference_number,
      clientName: referral.client_name,
      clientCompany: referral.client_company,
      projectType: referral.project_type,
      valueRange: referral.value_range,
      location: referral.location,
      timeline: referral.timeline,
    };

    // Use final_value if set, otherwise use the estimated value_range
    const finalValue = referral.final_value || referral.value_range || 'Not specified';

    const results: { recipient: string; sent: boolean }[] = [];

    // Send to submitter
    const submitterSent = await sendReferralCompleted(
      {
        email: referral.submitter.email,
        fullName: referral.submitter.full_name,
      },
      referralData,
      finalValue,
      completionDate
    );
    results.push({ recipient: 'submitter', sent: submitterSent });

    // Send to matched member if exists
    if (referral.matched_member) {
      const matchedSent = await sendReferralCompleted(
        {
          email: referral.matched_member.email,
          fullName: referral.matched_member.full_name,
        },
        referralData,
        finalValue,
        completionDate
      );
      results.push({ recipient: 'matched_member', sent: matchedSent });
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Completion emails sent`,
    });
  } catch (error) {
    console.error('[NotifyCompleted] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
