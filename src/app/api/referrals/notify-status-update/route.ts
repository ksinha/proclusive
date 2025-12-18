import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendReferralStatusUpdate } from '@/lib/email/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const { referralId, newStatus } = await request.json();

    if (!referralId || !newStatus) {
      return NextResponse.json(
        { error: 'Referral ID and new status are required' },
        { status: 400 }
      );
    }

    // Only send updates for REVIEWED and ENGAGED (MATCHED is handled separately, COMPLETED has its own endpoint)
    if (!['REVIEWED', 'ENGAGED'].includes(newStatus)) {
      return NextResponse.json({
        success: true,
        message: 'No status update email needed for this status',
      });
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
      console.error('[NotifyStatusUpdate] Error fetching referral:', refError);
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      );
    }

    const updateDate = new Date().toLocaleDateString('en-US', {
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

    const results: { recipient: string; sent: boolean }[] = [];

    // Map status to the format expected by sendReferralStatusUpdate
    const statusMap: Record<string, 'reviewed' | 'matched' | 'engaged'> = {
      REVIEWED: 'reviewed',
      MATCHED: 'matched',
      ENGAGED: 'engaged',
    };

    const currentStage = statusMap[newStatus];

    // Always send to submitter
    const submitterSent = await sendReferralStatusUpdate(
      {
        email: referral.submitter.email,
        fullName: referral.submitter.full_name,
      },
      referralData,
      currentStage,
      updateDate
    );
    results.push({ recipient: 'submitter', sent: submitterSent });

    // For ENGAGED status, also send to matched member if exists
    if (newStatus === 'ENGAGED' && referral.matched_member) {
      const matchedSent = await sendReferralStatusUpdate(
        {
          email: referral.matched_member.email,
          fullName: referral.matched_member.full_name,
        },
        referralData,
        currentStage,
        updateDate
      );
      results.push({ recipient: 'matched_member', sent: matchedSent });
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Status update emails sent`,
    });
  } catch (error) {
    console.error('[NotifyStatusUpdate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
