import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazily create Supabase admin client for auth operations
function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Email notification helper
async function sendEmailChangeNotification(
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent: string
): Promise<boolean> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@proclusive.com';

  if (!SENDGRID_API_KEY) {
    console.log('[UpdateMemberEmail] SendGrid not configured - logging email instead:');
    console.log(`  To: ${toEmail}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Content: ${textContent}`);
    return true; // Return success in dev mode
  }

  try {
    // Dynamic import to avoid issues if @sendgrid/mail is not available
    const sgMail = (await import('@sendgrid/mail')).default;
    sgMail.setApiKey(SENDGRID_API_KEY);

    await sgMail.send({
      to: toEmail,
      from: FROM_EMAIL,
      subject,
      html: htmlContent,
      text: textContent,
    });

    console.log(`[UpdateMemberEmail] Email sent successfully to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`[UpdateMemberEmail] Failed to send email to ${toEmail}:`, error);
    return false;
  }
}

// Email template wrapper (matches Proclusive brand styling)
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1a1d27; font-family: Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1a1d27;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #252833; border-radius: 12px; border: 1px solid rgba(201, 169, 98, 0.2);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <h1 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 600; color: #f8f8fa; letter-spacing: 0.15em; text-transform: uppercase;">PROCLUSIVE</h1>
              <div style="width: 60px; height: 2px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 15px auto 0;"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Signature -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0 0 4px 0; font-size: 13px; color: #b0b2bc;">Warm regards,</p>
              <p style="margin: 0; font-size: 13px; color: #f8f8fa; font-weight: 600;">The Proclusive Team</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 30px 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0; font-size: 12px; color: #6a6d78;">
                &copy; 2025 Proclusive. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { profileId, oldEmail, newEmail, memberName } = await request.json();

    // Validate required fields
    if (!profileId || !oldEmail || !newEmail) {
      return NextResponse.json(
        { error: 'profileId, oldEmail, and newEmail are required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format for newEmail' },
        { status: 400 }
      );
    }

    if (oldEmail.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from old email' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Verify the requester is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the requester is an admin (using is_admin field)
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !adminProfile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Verify the target member exists and their current email matches
    const { data: memberProfile, error: memberError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', profileId)
      .single();

    if (memberError || !memberProfile) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    if (memberProfile.email.toLowerCase() !== oldEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Old email does not match member current email' },
        { status: 400 }
      );
    }

    // Use admin client to update user email in Supabase Auth
    const supabaseAdmin = getSupabaseAdmin();

    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      profileId,
      { email: newEmail }
    );

    if (authUpdateError) {
      console.error('[UpdateMemberEmail] Failed to update auth email:', authUpdateError);
      return NextResponse.json(
        { error: 'Failed to update email in authentication system' },
        { status: 500 }
      );
    }

    // Update email in profiles table
    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({
        email: newEmail,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId);

    if (profileUpdateError) {
      console.error('[UpdateMemberEmail] Failed to update profile email:', profileUpdateError);
      // Note: Auth email was already updated, but profile update failed
      // This is a partial failure state
      return NextResponse.json(
        { error: 'Email updated in auth but failed to update profile' },
        { status: 500 }
      );
    }

    // Log admin action
    await supabaseAdmin.from('admin_audit_log').insert({
      admin_id: user.id,
      action: 'updated_member_email',
      entity_type: 'profile',
      entity_id: profileId,
      details: {
        old_email: oldEmail,
        new_email: newEmail,
        member_name: memberName || memberProfile.full_name,
      },
    });

    // Send notification to OLD email
    const oldEmailHtml = emailWrapper(`
      <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hello,</p>

      <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Your email address for your Proclusive account has been changed to <strong style="color: #f8f8fa;">${newEmail}</strong> by an administrator.</p>

      <div style="background-color: rgba(201, 169, 98, 0.1); padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #c9a962;">
        <p style="color: #f8f8fa; font-size: 14px; line-height: 1.6; margin: 0;">If you did not request this change, please contact support immediately.</p>
      </div>

      <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">You can reach us by replying to this email.</p>
    `);

    const oldEmailText = `Hello,

Your email address for your Proclusive account has been changed to ${newEmail} by an administrator.

If you did not request this change, please contact support immediately.

Warm regards,
The Proclusive Team`;

    const oldEmailSent = await sendEmailChangeNotification(
      oldEmail,
      'Your Proclusive Email Has Been Changed',
      oldEmailHtml,
      oldEmailText
    );

    // Send notification to NEW email
    const newEmailHtml = emailWrapper(`
      <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hello,</p>

      <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Your Proclusive account email has been updated to this address by an administrator.</p>

      <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">You can now use this email address to log in to your account.</p>

      <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">If you have any questions, please reply to this email.</p>
    `);

    const newEmailText = `Hello,

Your Proclusive account email has been updated to this address by an administrator.

You can now use this email address to log in to your account.

If you have any questions, please reply to this email.

Warm regards,
The Proclusive Team`;

    const newEmailSent = await sendEmailChangeNotification(
      newEmail,
      'Your Proclusive Account Email Has Been Updated',
      newEmailHtml,
      newEmailText
    );

    console.log(`[UpdateMemberEmail] Email updated for member ${profileId}: ${oldEmail} -> ${newEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Email updated successfully',
      notifications: {
        oldEmailNotified: oldEmailSent,
        newEmailNotified: newEmailSent,
      },
    });
  } catch (error) {
    console.error('[UpdateMemberEmail] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
