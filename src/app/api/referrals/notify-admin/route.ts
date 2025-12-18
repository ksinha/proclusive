import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendNewReferralNotification } from '@/lib/email/sendgrid';

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

    // Get the referral with submitter info
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select(`
        *,
        submitter:profiles!referrals_submitted_by_fkey(full_name, company_name)
      `)
      .eq('id', referralId)
      .single();

    if (referralError || !referral) {
      console.error('Error fetching referral:', referralError);
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Send email notification to admin
    const success = await sendNewReferralNotification(
      {
        referralId: referral.id,
        referenceNumber: referral.reference_number,
        clientName: referral.client_name,
        clientCompany: referral.client_company,
        projectType: referral.project_type,
        valueRange: referral.value_range,
        location: referral.location,
        timeline: referral.timeline,
      },
      {
        fullName: referral.submitter.full_name,
        companyName: referral.submitter.company_name,
      }
    );

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in notify-admin API:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
