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
/**
 * Verification point labels for emails
 */
const VERIFICATION_POINT_LABELS: Record<string, string> = {
  point_1_business_reg: "Business Registration",
  point_2_prof_license: "Professional License",
  point_3_liability_ins: "Liability Insurance",
  point_4_workers_comp: "Workers' Compensation",
  point_5_contact_verify: "Contact Verification",
  point_6_portfolio: "Portfolio/Tax Compliance",
  point_7_references: "Client References",
  point_8_certifications: "Professional Certifications",
  point_9_financial: "Financial Stability",
  point_10_legal_record: "Legal Record Check",
  point_11_operating_history: "Operating History",
  point_12_industry_awards: "Industry Recognition",
  point_13_satisfaction: "Client Satisfaction Metrics",
  point_14_network_contrib: "Network Contribution",
  point_15_enterprise: "Enterprise Assessment",
};

interface VerificationPointStatus {
  key: string;
  status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
}

interface ApplicantInfo {
  email: string;
  fullName: string;
}

/**
 * Send rejection notification to applicant with summary of verification statuses
 */
export async function sendApplicationRejectionNotification(
  applicant: ApplicantInfo,
  verificationPoints: VerificationPointStatus[],
  adminNotes: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping rejection email');
    return false;
  }

  // Build the status table HTML
  const statusRows = verificationPoints
    .filter(point => point.status !== 'not_submitted')
    .map(point => {
      const label = VERIFICATION_POINT_LABELS[point.key] || point.key;
      let statusIcon = '';
      let statusText = '';
      let statusColor = '';

      switch (point.status) {
        case 'verified':
          statusIcon = '✅';
          statusText = 'Approved';
          statusColor = '#16a34a';
          break;
        case 'rejected':
          statusIcon = '❌';
          statusText = 'Needs Revision';
          statusColor = '#dc2626';
          break;
        case 'pending':
          statusIcon = '⏳';
          statusText = 'Pending Review';
          statusColor = '#ca8a04';
          break;
        default:
          statusIcon = '○';
          statusText = 'Not Submitted';
          statusColor = '#6b7280';
      }

      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${label}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: ${statusColor}; font-weight: 500;">
            ${statusIcon} ${statusText}
          </td>
        </tr>
      `;
    })
    .join('');

  // Build plain text version
  const statusListText = verificationPoints
    .filter(point => point.status !== 'not_submitted')
    .map(point => {
      const label = VERIFICATION_POINT_LABELS[point.key] || point.key;
      let statusText = '';
      switch (point.status) {
        case 'verified': statusText = '✓ Approved'; break;
        case 'rejected': statusText = '✗ Needs Revision'; break;
        case 'pending': statusText = '⏳ Pending Review'; break;
        default: statusText = '○ Not Submitted';
      }
      return `- ${label}: ${statusText}`;
    })
    .join('\n');

  const msg = {
    to: applicant.email,
    from: FROM_EMAIL,
    subject: 'Action Required: Your Proclusive Application Needs Updates',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Application Update Required</h2>

        <p>Hi ${applicant.fullName},</p>

        <p>Thank you for applying to join the Proclusive network. After reviewing your application, we've identified some items that need to be revised before we can proceed.</p>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #991b1b; font-size: 14px;">What Needs To Be Fixed</h3>
          <p style="color: #7f1d1d; font-size: 14px; margin-bottom: 0;">
            ${adminNotes || 'Please review the items marked as "Needs Revision" below and upload corrected documents or information.'}
          </p>
        </div>

        <h3 style="color: #374151; margin-top: 24px;">Verification Status Summary</h3>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f9fafb;">
              <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Verification Point</th>
              <th style="padding: 12px; text-align: left; font-size: 13px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Status</th>
            </tr>
          </thead>
          <tbody style="font-size: 14px;">
            ${statusRows}
          </tbody>
        </table>

        <div style="background-color: #dbeafe; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #1e40af; font-size: 14px;">Next Steps</h3>
          <ol style="color: #1e3a8a; font-size: 14px; margin-bottom: 0; padding-left: 20px;">
            <li>Log in to your Proclusive account</li>
            <li>Review the items that need revision</li>
            <li>Upload new documents or update information</li>
            <li>Resubmit your application for review</li>
          </ol>
        </div>

        <a href="${APP_URL}/vetting"
           style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px; font-weight: 500;">
          Fix My Application
        </a>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If you have questions about what needs to be revised, please reply to this email and we'll be happy to help.
        </p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Best regards,<br>
          The Proclusive Team
        </p>
      </div>
    `,
    text: `
Application Update Required

Hi ${applicant.fullName},

Thank you for applying to join the Proclusive network. After reviewing your application, we've identified some items that need to be revised before we can proceed.

WHAT NEEDS TO BE FIXED:
${adminNotes || 'Please review the items marked as "Needs Revision" below and upload corrected documents or information.'}

VERIFICATION STATUS SUMMARY:
${statusListText}

NEXT STEPS:
1. Log in to your Proclusive account
2. Review the items that need revision
3. Upload new documents or update information
4. Resubmit your application for review

Fix your application at: ${APP_URL}/vetting

If you have questions about what needs to be revised, please reply to this email and we'll be happy to help.

Best regards,
The Proclusive Team
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Application rejection notification email sent to:', applicant.email);
    return true;
  } catch (error) {
    console.error('Failed to send rejection notification:', error);
    return false;
  }
}

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
