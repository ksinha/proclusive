import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@proclusive.com';
const ADMIN_EMAIL = process.env.SENDGRID_ADMIN_EMAIL || 'admin@proclusive.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface ReferralEmailData {
  clientName: string;
  clientCompany?: string | null;
  projectType: string;
  valueRange?: string | null;
  location: string;
  timeline?: string | null;
  referralId: string;
}

interface SubmitterInfo {
  fullName: string;
  companyName: string;
}

interface MatchedMemberInfo {
  email: string;
  fullName: string;
}

/**
 * Send notification to admin when a new referral is submitted
 */
export async function sendNewReferralNotification(
  referral: ReferralEmailData,
  submitter: SubmitterInfo
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const msg = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `New Referral Submitted by ${submitter.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">New Referral Submitted</h2>

        <p>A new referral has been submitted by <strong>${submitter.fullName}</strong> from <strong>${submitter.companyName}</strong>.</p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Referral Details</h3>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;">Client Name:</td>
              <td style="padding: 8px 0; color: #111827;"><strong>${referral.clientName}</strong></td>
            </tr>
            ${referral.clientCompany ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Client Company:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.clientCompany}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Project Type:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.projectType}</td>
            </tr>
            ${referral.valueRange ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Value Range:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.valueRange}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Location:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.location}</td>
            </tr>
            ${referral.timeline ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Timeline:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.timeline}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <a href="${APP_URL}/admin/referrals"
           style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
          Review Referral
        </a>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated notification from Proclusive.
        </p>
      </div>
    `,
    text: `
New Referral Submitted

A new referral has been submitted by ${submitter.fullName} from ${submitter.companyName}.

Referral Details:
- Client Name: ${referral.clientName}
${referral.clientCompany ? `- Client Company: ${referral.clientCompany}` : ''}
- Project Type: ${referral.projectType}
${referral.valueRange ? `- Value Range: ${referral.valueRange}` : ''}
- Location: ${referral.location}
${referral.timeline ? `- Timeline: ${referral.timeline}` : ''}

Review this referral at: ${APP_URL}/admin/referrals

This is an automated notification from Proclusive.
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('New referral notification email sent to admin');
    return true;
  } catch (error) {
    console.error('Failed to send new referral notification:', error);
    return false;
  }
}

/**
 * Send notification to member when they are matched to a referral
 */
export async function sendMatchedReferralNotification(
  referral: ReferralEmailData,
  member: MatchedMemberInfo,
  clientEmail?: string | null,
  clientPhone?: string | null
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const msg = {
    to: member.email,
    from: FROM_EMAIL,
    subject: `New Referral Match: ${referral.clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">You've Been Matched to a Referral!</h2>

        <p>Hi ${member.fullName},</p>

        <p>Great news! You've been matched to a new referral opportunity through Proclusive.</p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Project Details</h3>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; width: 140px;">Client Name:</td>
              <td style="padding: 8px 0; color: #111827;"><strong>${referral.clientName}</strong></td>
            </tr>
            ${referral.clientCompany ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Company:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.clientCompany}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Project Type:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.projectType}</td>
            </tr>
            ${referral.valueRange ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Value Range:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.valueRange}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Location:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.location}</td>
            </tr>
            ${referral.timeline ? `
            <tr>
              <td style="padding: 8px 0; color: #6b7280;">Timeline:</td>
              <td style="padding: 8px 0; color: #111827;">${referral.timeline}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${(clientEmail || clientPhone) ? `
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Client Contact Information</h3>

          <table style="width: 100%; border-collapse: collapse;">
            ${clientEmail ? `
            <tr>
              <td style="padding: 8px 0; color: #1e40af; width: 80px;">Email:</td>
              <td style="padding: 8px 0; color: #111827;">
                <a href="mailto:${clientEmail}" style="color: #1e40af;">${clientEmail}</a>
              </td>
            </tr>
            ` : ''}
            ${clientPhone ? `
            <tr>
              <td style="padding: 8px 0; color: #1e40af;">Phone:</td>
              <td style="padding: 8px 0; color: #111827;">
                <a href="tel:${clientPhone}" style="color: #1e40af;">${clientPhone}</a>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>
        ` : ''}

        <a href="${APP_URL}/dashboard/referrals"
           style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
          View in Dashboard
        </a>

        <p style="margin-top: 30px;">Please reach out to the client within 24-48 hours to discuss their project needs.</p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated notification from Proclusive.
        </p>
      </div>
    `,
    text: `
You've Been Matched to a Referral!

Hi ${member.fullName},

Great news! You've been matched to a new referral opportunity through Proclusive.

Project Details:
- Client Name: ${referral.clientName}
${referral.clientCompany ? `- Company: ${referral.clientCompany}` : ''}
- Project Type: ${referral.projectType}
${referral.valueRange ? `- Value Range: ${referral.valueRange}` : ''}
- Location: ${referral.location}
${referral.timeline ? `- Timeline: ${referral.timeline}` : ''}

${(clientEmail || clientPhone) ? `
Client Contact Information:
${clientEmail ? `- Email: ${clientEmail}` : ''}
${clientPhone ? `- Phone: ${clientPhone}` : ''}
` : ''}

View this referral in your dashboard: ${APP_URL}/dashboard/referrals

Please reach out to the client within 24-48 hours to discuss their project needs.

This is an automated notification from Proclusive.
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Matched referral notification email sent to member');
    return true;
  } catch (error) {
    console.error('Failed to send matched referral notification:', error);
    return false;
  }
}
