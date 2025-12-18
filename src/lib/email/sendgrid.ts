import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@proclusive.com';
const ADMIN_EMAIL = process.env.SENDGRID_ADMIN_EMAIL || 'admin@proclusive.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

console.log('[SendGrid] Initializing with config:', {
  hasApiKey: !!SENDGRID_API_KEY,
  fromEmail: FROM_EMAIL,
  adminEmail: ADMIN_EMAIL,
  appUrl: APP_URL,
});

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('[SendGrid] API key configured');
} else {
  console.warn('[SendGrid] WARNING: No API key found in environment');
}

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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1d27; color: #f8f8fa; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c9a962; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; margin: 0 0 8px 0;">Proclusive</h1>
          <div style="height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 16px 0;"></div>
        </div>

        <h2 style="color: #c9a962; font-size: 24px; margin-bottom: 16px;">New Referral Submitted</h2>

        <p style="color: #b0b2bc; line-height: 1.6;">A new referral has been submitted by <strong style="color: #f8f8fa;">${submitter.fullName}</strong> from <strong style="color: #f8f8fa;">${submitter.companyName}</strong>.</p>

        <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
          <h3 style="margin-top: 0; color: #c9a962; font-size: 18px; margin-bottom: 16px;">Referral Details</h3>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6a6d78; width: 140px;">Client Name:</td>
              <td style="padding: 10px 0; color: #f8f8fa;"><strong>${referral.clientName}</strong></td>
            </tr>
            ${referral.clientCompany ? `
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Client Company:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.clientCompany}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Project Type:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.projectType}</td>
            </tr>
            ${referral.valueRange ? `
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Value Range:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.valueRange}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Location:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.location}</td>
            </tr>
            ${referral.timeline ? `
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Timeline:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.timeline}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/admin/referrals"
             style="display: inline-block; background-color: #c9a962; color: #1a1d27; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Review Referral
          </a>
        </div>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <p style="color: #6a6d78; font-size: 13px; margin: 0; text-align: center;">
            This is an automated notification from Proclusive.
          </p>
        </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1d27; color: #f8f8fa; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c9a962; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; margin: 0 0 8px 0;">Proclusive</h1>
          <div style="height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 16px 0;"></div>
        </div>

        <h2 style="color: #c9a962; font-size: 24px; margin-bottom: 16px;">Application Update Required</h2>

        <p style="color: #b0b2bc; line-height: 1.6;">Hi ${applicant.fullName},</p>

        <p style="color: #b0b2bc; line-height: 1.6;">Thank you for applying to join the Proclusive network. After reviewing your application, we've identified some items that need to be revised before we can proceed.</p>

        <div style="background-color: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h3 style="margin-top: 0; color: #f87171; font-size: 16px;">What Needs To Be Fixed</h3>
          <p style="color: #f8f8fa; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
            ${adminNotes || 'Please review the items marked as "Needs Revision" below and upload corrected documents or information.'}
          </p>
        </div>

        <h3 style="color: #c9a962; margin-top: 24px; font-size: 18px;">Verification Status Summary</h3>

        <table style="width: 100%; border-collapse: collapse; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background-color: #252833;">
              <th style="padding: 12px; text-align: left; font-size: 13px; color: #6a6d78; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">Verification Point</th>
              <th style="padding: 12px; text-align: left; font-size: 13px; color: #6a6d78; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">Status</th>
            </tr>
          </thead>
          <tbody style="font-size: 14px;">
            ${statusRows}
          </tbody>
        </table>

        <div style="background-color: rgba(201, 169, 98, 0.1); padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.3);">
          <h3 style="margin-top: 0; color: #c9a962; font-size: 16px;">Next Steps</h3>
          <ol style="color: #b0b2bc; font-size: 14px; line-height: 1.8; margin-bottom: 0; padding-left: 20px;">
            <li>Log in to your Proclusive account</li>
            <li>Review the items that need revision</li>
            <li>Upload new documents or update information</li>
            <li>Resubmit your application for review</li>
          </ol>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/vetting"
             style="display: inline-block; background-color: #c9a962; color: #1a1d27; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Fix My Application
          </a>
        </div>

        <p style="color: #b0b2bc; font-size: 14px; line-height: 1.6; margin-top: 30px;">
          If you have questions about what needs to be revised, please reply to this email and we'll be happy to help.
        </p>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <p style="color: #6a6d78; font-size: 13px; margin: 0 0 8px 0;">Best regards,</p>
          <p style="color: #6a6d78; font-size: 13px; margin: 0; font-weight: 600;">The Proclusive Team</p>
        </div>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1d27; color: #f8f8fa; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c9a962; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; margin: 0 0 8px 0;">Proclusive</h1>
          <div style="height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 16px 0;"></div>
        </div>

        <h2 style="color: #c9a962; font-size: 24px; margin-bottom: 16px;">You've Been Matched to a Referral!</h2>

        <p style="color: #b0b2bc; line-height: 1.6;">Hi ${member.fullName},</p>

        <p style="color: #b0b2bc; line-height: 1.6;">Great news! You've been matched to a new referral opportunity through Proclusive.</p>

        <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
          <h3 style="margin-top: 0; color: #c9a962; font-size: 18px; margin-bottom: 16px;">Project Details</h3>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6a6d78; width: 140px;">Client Name:</td>
              <td style="padding: 10px 0; color: #f8f8fa;"><strong>${referral.clientName}</strong></td>
            </tr>
            ${referral.clientCompany ? `
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Company:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.clientCompany}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Project Type:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.projectType}</td>
            </tr>
            ${referral.valueRange ? `
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Value Range:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.valueRange}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Location:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.location}</td>
            </tr>
            ${referral.timeline ? `
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Timeline:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">${referral.timeline}</td>
            </tr>
            ` : ''}
          </table>
        </div>

        ${(clientEmail || clientPhone) ? `
        <div style="background-color: rgba(201, 169, 98, 0.1); padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.3);">
          <h3 style="margin-top: 0; color: #c9a962; font-size: 18px; margin-bottom: 16px;">Client Contact Information</h3>

          <table style="width: 100%; border-collapse: collapse;">
            ${clientEmail ? `
            <tr>
              <td style="padding: 10px 0; color: #c9a962; width: 80px;">Email:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">
                <a href="mailto:${clientEmail}" style="color: #c9a962; text-decoration: none;">${clientEmail}</a>
              </td>
            </tr>
            ` : ''}
            ${clientPhone ? `
            <tr>
              <td style="padding: 10px 0; color: #c9a962;">Phone:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">
                <a href="tel:${clientPhone}" style="color: #c9a962; text-decoration: none;">${clientPhone}</a>
              </td>
            </tr>
            ` : ''}
          </table>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/dashboard/referrals"
             style="display: inline-block; background-color: #c9a962; color: #1a1d27; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            View in Dashboard
          </a>
        </div>

        <p style="color: #b0b2bc; line-height: 1.6;">Please reach out to the client within 24-48 hours to discuss their project needs.</p>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <p style="color: #6a6d78; font-size: 13px; margin: 0; text-align: center;">
            This is an automated notification from Proclusive.
          </p>
        </div>
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

/**
 * Send notification to applicant when they submit their application
 */
export async function sendApplicationSubmittedNotification(
  applicant: ApplicantInfo
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const msg = {
    to: applicant.email,
    from: FROM_EMAIL,
    subject: 'Application Received - Proclusive Network',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1d27; color: #f8f8fa; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c9a962; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; margin: 0 0 8px 0;">Proclusive</h1>
          <div style="height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 16px 0;"></div>
        </div>

        <h2 style="color: #c9a962; font-size: 24px; margin-bottom: 16px;">Application Received</h2>

        <p style="color: #b0b2bc; line-height: 1.6;">Hi ${applicant.fullName},</p>

        <p style="color: #b0b2bc; line-height: 1.6;">Thank you for submitting your application to join the Proclusive network! We've received your application and our team will begin reviewing it shortly.</p>

        <div style="background-color: rgba(201, 169, 98, 0.1); padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.3);">
          <h3 style="margin-top: 0; color: #c9a962; font-size: 18px; margin-bottom: 12px;">What Happens Next?</h3>
          <ul style="color: #b0b2bc; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Our verification team will review your submitted documents</li>
            <li>We'll verify your credentials and qualifications</li>
            <li>You'll receive an email notification once the review is complete</li>
            <li>The review process typically takes 2-3 business days</li>
          </ul>
        </div>

        <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(255, 255, 255, 0.08);">
          <h3 style="margin-top: 0; color: #f8f8fa; font-size: 18px; margin-bottom: 12px;">Need to Make Changes?</h3>
          <p style="color: #b0b2bc; line-height: 1.6; margin: 0;">
            If you need to update any information in your application, please log in to your account and navigate to the vetting page.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/vetting"
             style="display: inline-block; background-color: #c9a962; color: #1a1d27; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            View Application Status
          </a>
        </div>

        <p style="color: #b0b2bc; line-height: 1.6;">If you have any questions, please don't hesitate to reach out to our team.</p>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <p style="color: #6a6d78; font-size: 13px; margin: 0 0 8px 0;">Best regards,</p>
          <p style="color: #6a6d78; font-size: 13px; margin: 0; font-weight: 600;">The Proclusive Team</p>
        </div>
      </div>
    `,
    text: `
Application Received - Proclusive Network

Hi ${applicant.fullName},

Thank you for submitting your application to join the Proclusive network! We've received your application and our team will begin reviewing it shortly.

WHAT HAPPENS NEXT?
- Our verification team will review your submitted documents
- We'll verify your credentials and qualifications
- You'll receive an email notification once the review is complete
- The review process typically takes 2-3 business days

NEED TO MAKE CHANGES?
If you need to update any information in your application, please log in to your account and navigate to the vetting page.

View your application status at: ${APP_URL}/vetting

If you have any questions, please don't hesitate to reach out to our team.

Best regards,
The Proclusive Team
    `,
  };

  try {
    console.log('[SendGrid] Sending application submitted email to:', applicant.email);
    const response = await sgMail.send(msg);
    console.log('[SendGrid] Application submitted email sent successfully:', response[0].statusCode);
    return true;
  } catch (error: any) {
    console.error('[SendGrid] Failed to send application submitted notification:', {
      message: error.message,
      code: error.code,
      response: error.response?.body,
    });
    return false;
  }
}

/**
 * Send notification to applicant when their application is approved
 */
export async function sendApplicationApprovedNotification(
  applicant: ApplicantInfo,
  badgeLevel: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const badgeNames: Record<string, string> = {
    verified: 'Verified',
    vetted: 'Vetted',
    elite: 'Elite',
    compliance: 'Compliance',
    capability: 'Capability',
    reputation: 'Reputation',
    enterprise: 'Enterprise',
  };

  const badgeName = badgeNames[badgeLevel] || 'Verified';

  const msg = {
    to: applicant.email,
    from: FROM_EMAIL,
    subject: 'Welcome to Proclusive - Application Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1d27; color: #f8f8fa; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c9a962; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; margin: 0 0 8px 0;">Proclusive</h1>
          <div style="height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 16px 0;"></div>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #c9a962, #d4b674); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(201, 169, 98, 0.3);">
            <h2 style="color: #1a1d27; font-size: 28px; margin: 0; font-weight: bold;">Congratulations!</h2>
          </div>
        </div>

        <p style="color: #b0b2bc; line-height: 1.6; font-size: 16px;">Hi ${applicant.fullName},</p>

        <p style="color: #b0b2bc; line-height: 1.6; font-size: 16px;">We're thrilled to inform you that your application has been approved! Welcome to the Proclusive network.</p>

        <div style="background-color: rgba(201, 169, 98, 0.1); padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.3); text-align: center;">
          <p style="color: #b0b2bc; margin: 0 0 12px 0; font-size: 14px;">You've been awarded the</p>
          <div style="display: inline-block; background-color: #c9a962; color: #1a1d27; padding: 10px 24px; border-radius: 6px; font-weight: bold; font-size: 18px;">
            ${badgeName} Badge
          </div>
        </div>

        <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(255, 255, 255, 0.08);">
          <h3 style="margin-top: 0; color: #c9a962; font-size: 18px; margin-bottom: 16px;">What's Next?</h3>
          <ul style="color: #b0b2bc; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Log in to your member dashboard</li>
            <li>Complete your profile to appear in our directory</li>
            <li>Start submitting referrals to fellow members</li>
            <li>Connect with other verified professionals</li>
            <li>Access exclusive networking opportunities</li>
          </ul>
        </div>

        <div style="background-color: rgba(201, 169, 98, 0.1); padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #c9a962;">
          <p style="color: #c9a962; line-height: 1.6; margin: 0; font-size: 14px;">
            <strong>Pro Tip:</strong> Make your profile public in the directory to maximize your visibility and receive more referrals from the network.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/dashboard"
             style="display: inline-block; background-color: #c9a962; color: #1a1d27; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Go to Dashboard
          </a>
        </div>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <p style="color: #b0b2bc; line-height: 1.6; margin: 0 0 16px 0;">
            We're excited to have you as part of our community. Together, we'll build a network of excellence.
          </p>
          <p style="color: #6a6d78; font-size: 13px; margin: 0 0 8px 0;">Best regards,</p>
          <p style="color: #6a6d78; font-size: 13px; margin: 0; font-weight: 600;">The Proclusive Team</p>
        </div>
      </div>
    `,
    text: `
Welcome to Proclusive - Application Approved!

CONGRATULATIONS!

Hi ${applicant.fullName},

We're thrilled to inform you that your application has been approved! Welcome to the Proclusive network.

You've been awarded the ${badgeName} Badge

WHAT'S NEXT?
- Log in to your member dashboard
- Complete your profile to appear in our directory
- Start submitting referrals to fellow members
- Connect with other verified professionals
- Access exclusive networking opportunities

PRO TIP: Make your profile public in the directory to maximize your visibility and receive more referrals from the network.

Go to your dashboard: ${APP_URL}/dashboard

We're excited to have you as part of our community. Together, we'll build a network of excellence.

Best regards,
The Proclusive Team
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Application approved notification email sent to:', applicant.email);
    return true;
  } catch (error) {
    console.error('Failed to send application approved notification:', error);
    return false;
  }
}

/**
 * Send notification to admin when a new application is submitted
 */
export async function sendNewApplicationNotification(
  applicant: ApplicantInfo,
  applicationId: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const msg = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `New Application Submitted by ${applicant.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1d27; color: #f8f8fa; padding: 32px; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #c9a962; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; margin: 0 0 8px 0;">Proclusive</h1>
          <div style="height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 16px 0;"></div>
        </div>

        <h2 style="color: #c9a962; font-size: 24px; margin-bottom: 16px;">New Application Submitted</h2>

        <p style="color: #b0b2bc; line-height: 1.6;">A new application has been submitted and is ready for review.</p>

        <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
          <h3 style="margin-top: 0; color: #c9a962; font-size: 18px; margin-bottom: 16px;">Applicant Information</h3>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6a6d78; width: 140px;">Full Name:</td>
              <td style="padding: 10px 0; color: #f8f8fa;"><strong>${applicant.fullName}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Email:</td>
              <td style="padding: 10px 0; color: #f8f8fa;">
                <a href="mailto:${applicant.email}" style="color: #c9a962; text-decoration: none;">${applicant.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6a6d78;">Application ID:</td>
              <td style="padding: 10px 0; color: #f8f8fa; font-family: monospace; font-size: 12px;">${applicationId}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: rgba(201, 169, 98, 0.1); padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #c9a962;">
          <p style="color: #c9a962; line-height: 1.6; margin: 0; font-size: 14px;">
            <strong>Action Required:</strong> Please review this application in the admin dashboard and verify the submitted documents.
          </p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${APP_URL}/admin/dashboard"
             style="display: inline-block; background-color: #c9a962; color: #1a1d27; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Review Application
          </a>
        </div>

        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
          <p style="color: #6a6d78; font-size: 13px; margin: 0; text-align: center;">
            This is an automated notification from Proclusive.
          </p>
        </div>
      </div>
    `,
    text: `
New Application Submitted

A new application has been submitted and is ready for review.

APPLICANT INFORMATION:
- Full Name: ${applicant.fullName}
- Email: ${applicant.email}
- Application ID: ${applicationId}

ACTION REQUIRED: Please review this application in the admin dashboard and verify the submitted documents.

Review application at: ${APP_URL}/admin/dashboard

This is an automated notification from Proclusive.
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('New application notification email sent to admin');
    return true;
  } catch (error) {
    console.error('Failed to send new application notification:', error);
    return false;
  }
}
