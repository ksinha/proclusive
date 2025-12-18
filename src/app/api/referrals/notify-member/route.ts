import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendMatchedReferralNotification } from '@/lib/email/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const { referralId, memberId } = await request.json();

    if (!referralId || !memberId) {
      return NextResponse.json(
        { error: 'Referral ID and Member ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the referral
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('id', referralId)
      .single();

    if (referralError || !referral) {
      console.error('Error fetching referral:', referralError);
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    // Get the matched member info
    const { data: member, error: memberError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', memberId)
      .single();

    if (memberError || !member) {
      console.error('Error fetching member:', memberError);
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Send email notification to matched member
    const success = await sendMatchedReferralNotification(
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
        email: member.email,
        fullName: member.full_name,
      },
      referral.client_email,
      referral.client_phone
    );

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error in notify-member API:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
