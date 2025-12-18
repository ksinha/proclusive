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

// Helper to get first name from full name
function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || fullName;
}

// Helper to format date
function formatDate(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Email wrapper template
function emailWrapper(content: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1d27; color: #f8f8fa; padding: 32px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #c9a962; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; margin: 0 0 8px 0; letter-spacing: 0.1em;">PROCLUSIVE</h1>
        <div style="height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 16px 0;"></div>
      </div>
      ${content}
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
        <p style="color: #b0b2bc; font-size: 13px; margin: 0 0 4px 0;">Warm regards,</p>
        <p style="color: #f8f8fa; font-size: 13px; margin: 0; font-weight: 600;">The Proclusive Team</p>
      </div>
    </div>
  `;
}

// CTA Button
function ctaButton(text: string, url: string): string {
  return `
    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="display: inline-block; background-color: #c9a962; color: #1a1d27; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
        ${text}
      </a>
    </div>
  `;
}

// ============================================
// INTERFACES
// ============================================

interface ApplicantInfo {
  email: string;
  fullName: string;
  companyName?: string;
  primaryTrade?: string;
}

interface ReferralEmailData {
  referralId: string;
  clientName: string;
  clientCompany?: string | null;
  projectType: string;
  valueRange?: string | null;
  location: string;
  timeline?: string | null;
}

interface SubmitterInfo {
  fullName: string;
  companyName: string;
}

interface MatchedMemberInfo {
  email: string;
  fullName: string;
}

interface PaymentInfo {
  amount: string;
  date: string;
  membershipType: string;
}

interface VerificationPointStatus {
  key: string;
  status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
}

// ============================================
// 1.3 APPLICATION RECEIVED (MEMBER)
// ============================================
export async function sendApplicationSubmittedNotification(
  applicant: ApplicantInfo
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const firstName = getFirstName(applicant.fullName);

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Thank you for applying to join Proclusive. We've received your application and our team is reviewing your submission.</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;"><strong style="color: #f8f8fa;">Here's what happens next:</strong> We'll verify your credentials and professional background as part of our Vetting-as-a-Service™ (VaaS) process. Most applications are reviewed within 3–5 business days.</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">If we need any additional information, we'll reach out directly. In the meantime, if you have questions, simply reply to this email.</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">We appreciate your interest in joining a network built on trust and quality.</p>
  `;

  const msg = {
    to: applicant.email,
    from: FROM_EMAIL,
    subject: "We've Received Your Application",
    html: emailWrapper(content),
    text: `Hi ${firstName},

Thank you for applying to join Proclusive. We've received your application and our team is reviewing your submission.

Here's what happens next: We'll verify your credentials and professional background as part of our Vetting-as-a-Service™ (VaaS) process. Most applications are reviewed within 3–5 business days.

If we need any additional information, we'll reach out directly. In the meantime, if you have questions, simply reply to this email.

We appreciate your interest in joining a network built on trust and quality.

Warm regards,
The Proclusive Team`,
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

// ============================================
// 1.4 APPLICATION RECEIVED (ADMIN)
// ============================================
export async function sendNewApplicationNotification(
  applicant: ApplicantInfo,
  applicationId: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const submissionDate = formatDate();

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">New membership application received.</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 16px;">Applicant Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6a6d78; width: 120px;">Name:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${applicant.fullName}</td>
        </tr>
        ${applicant.companyName ? `
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Company:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${applicant.companyName}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Email:</td>
          <td style="padding: 8px 0; color: #f8f8fa;"><a href="mailto:${applicant.email}" style="color: #c9a962; text-decoration: none;">${applicant.email}</a></td>
        </tr>
        ${applicant.primaryTrade ? `
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Service Category:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${applicant.primaryTrade}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Submitted:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${submissionDate}</td>
        </tr>
      </table>
    </div>
    ${ctaButton('Review Application', `${APP_URL}/admin/dashboard`)}
  `;

  const msg = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `New Application: ${applicant.fullName}${applicant.companyName ? ` — ${applicant.companyName}` : ''}`,
    html: emailWrapper(content),
    text: `New membership application received.

Applicant Details:
- Name: ${applicant.fullName}
${applicant.companyName ? `- Company: ${applicant.companyName}` : ''}
- Email: ${applicant.email}
${applicant.primaryTrade ? `- Service Category: ${applicant.primaryTrade}` : ''}
- Submitted: ${submissionDate}

Review Application: ${APP_URL}/admin/dashboard`,
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

// ============================================
// 1.5 PAYMENT RECEIVED
// ============================================
export async function sendPaymentReceivedNotification(
  applicant: ApplicantInfo,
  payment: PaymentInfo
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const firstName = getFirstName(applicant.fullName);

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">We've received your membership payment. Thank you.</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 16px;">Payment Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6a6d78; width: 120px;">Amount:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${payment.amount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Date:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${payment.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Membership:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${payment.membershipType}</td>
        </tr>
      </table>
    </div>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Your application is now complete and under review. You'll hear from us soon regarding next steps.</p>
  `;

  const msg = {
    to: applicant.email,
    from: FROM_EMAIL,
    subject: 'Payment Confirmed — Thank You',
    html: emailWrapper(content),
    text: `Hi ${firstName},

We've received your membership payment. Thank you.

Payment Details:
- Amount: ${payment.amount}
- Date: ${payment.date}
- Membership: ${payment.membershipType}

Your application is now complete and under review. You'll hear from us soon regarding next steps.

Warm regards,
The Proclusive Team`,
  };

  try {
    await sgMail.send(msg);
    console.log('Payment received notification email sent to:', applicant.email);
    return true;
  } catch (error) {
    console.error('Failed to send payment received notification:', error);
    return false;
  }
}

// ============================================
// 1.6 APPLICATION NEEDS ATTENTION (CORRECTIONS REQUIRED)
// ============================================
export async function sendApplicationRejectionNotification(
  applicant: ApplicantInfo,
  adminNotes: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping rejection email');
    return false;
  }

  const firstName = getFirstName(applicant.fullName);

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Thank you for your interest in joining Proclusive. After reviewing your application, we need to bring something to your attention.</p>

    <div style="background-color: rgba(201, 169, 98, 0.1); padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.3);">
      <p style="color: #f8f8fa; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${adminNotes || 'Please review your application for any missing or incomplete information.'}</p>
    </div>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">We'd be happy to reconsider your application once this is addressed. Please reply to this email with any questions, or log in to update your application:</p>

    ${ctaButton('Update My Application', `${APP_URL}/vetting`)}

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">We appreciate your understanding and look forward to working with you.</p>
  `;

  const msg = {
    to: applicant.email,
    from: FROM_EMAIL,
    subject: 'Your Proclusive Application — Action Needed',
    html: emailWrapper(content),
    text: `Hi ${firstName},

Thank you for your interest in joining Proclusive. After reviewing your application, we need to bring something to your attention.

${adminNotes || 'Please review your application for any missing or incomplete information.'}

We'd be happy to reconsider your application once this is addressed. Please reply to this email with any questions, or log in to update your application:

${APP_URL}/vetting

We appreciate your understanding and look forward to working with you.

Warm regards,
The Proclusive Team`,
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

// ============================================
// 1.7 APPLICATION NEEDS ATTENTION (INCOMPLETE STEPS)
// ============================================
export async function sendIncompleteApplicationReminder(
  applicant: ApplicantInfo,
  incompleteSteps: string[]
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const firstName = getFirstName(applicant.fullName);
  const stepsList = incompleteSteps.map(step => `<li style="color: #b0b2bc; padding: 4px 0;">${step}</li>`).join('');

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">We noticed you started your Proclusive membership application but haven't completed all the steps yet.</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(255, 255, 255, 0.08);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 12px;">Remaining Steps:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${stepsList}
      </ul>
    </div>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Pick up where you left off:</p>

    ${ctaButton('Complete My Application', `${APP_URL}/vetting`)}

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">If you have questions or need assistance, simply reply to this email. We're here to help.</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Looking forward to welcoming you to the network.</p>
  `;

  const msg = {
    to: applicant.email,
    from: FROM_EMAIL,
    subject: 'Complete Your Proclusive Application',
    html: emailWrapper(content),
    text: `Hi ${firstName},

We noticed you started your Proclusive membership application but haven't completed all the steps yet.

Remaining steps:
${incompleteSteps.map(step => `- ${step}`).join('\n')}

Pick up where you left off: ${APP_URL}/vetting

If you have questions or need assistance, simply reply to this email. We're here to help.

Looking forward to welcoming you to the network.

Warm regards,
The Proclusive Team`,
  };

  try {
    await sgMail.send(msg);
    console.log('Incomplete application reminder email sent to:', applicant.email);
    return true;
  } catch (error) {
    console.error('Failed to send incomplete application reminder:', error);
    return false;
  }
}

// ============================================
// 2.1 WELCOME TO PROCLUSIVE (APPLICATION APPROVED)
// ============================================
export async function sendApplicationApprovedNotification(
  applicant: ApplicantInfo,
  badgeLevel: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const firstName = getFirstName(applicant.fullName);

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;"><strong style="color: #c9a962;">Congratulations</strong>—your membership has been approved. Welcome to Proclusive.</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">You now have access to a network of verified professionals in the built environment. Here's how to get started:</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(255, 255, 255, 0.08);">
      <ol style="margin: 0; padding-left: 20px; color: #b0b2bc; line-height: 2;">
        <li><strong style="color: #f8f8fa;">Log in to your dashboard</strong></li>
        <li><strong style="color: #f8f8fa;">Complete your profile</strong> — A polished profile helps other members find and trust you.</li>
        <li><strong style="color: #f8f8fa;">Explore the Member Directory</strong> — Connect with architects, contractors, designers, and specialists across the DC Metro area.</li>
        <li><strong style="color: #f8f8fa;">Submit your first referral</strong> — When you know someone who needs quality work, send them to a fellow member.</li>
      </ol>
    </div>

    ${ctaButton('Go to Dashboard', `${APP_URL}/dashboard`)}

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Questions? Reply to this email anytime. We're here to help you make the most of your membership.</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Welcome aboard.</p>

    <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
      <p style="color: #b0b2bc; font-size: 13px; margin: 0 0 4px 0;">Warm regards,</p>
      <p style="color: #f8f8fa; font-size: 13px; margin: 0; font-weight: 600;">Michelle Liefke</p>
      <p style="color: #6a6d78; font-size: 12px; margin: 4px 0 0 0;">Founder & CEO, Proclusive</p>
    </div>
  `;

  // Override the wrapper to use Michelle's signature instead
  const customWrapper = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1a1d27; color: #f8f8fa; padding: 32px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #c9a962; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; margin: 0 0 8px 0; letter-spacing: 0.1em;">PROCLUSIVE</h1>
        <div style="height: 1px; background: linear-gradient(90deg, transparent, #c9a962, transparent); margin: 16px 0;"></div>
      </div>
      ${content}
    </div>
  `;

  const msg = {
    to: applicant.email,
    from: FROM_EMAIL,
    subject: "Welcome to Proclusive — You're In",
    html: customWrapper,
    text: `Hi ${firstName},

Congratulations—your membership has been approved. Welcome to Proclusive.

You now have access to a network of verified professionals in the built environment. Here's how to get started:

1. Log in to your dashboard: ${APP_URL}/dashboard
2. Complete your profile — A polished profile helps other members find and trust you.
3. Explore the Member Directory — Connect with architects, contractors, designers, and specialists across the DC Metro area.
4. Submit your first referral — When you know someone who needs quality work, send them to a fellow member.

Questions? Reply to this email anytime. We're here to help you make the most of your membership.

Welcome aboard.

Warm regards,
Michelle Liefke
Founder & CEO, Proclusive`,
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

// ============================================
// 3.1 REFERRAL SUBMITTED CONFIRMATION
// ============================================
export async function sendReferralSubmittedConfirmation(
  submitter: SubmitterInfo & { email: string },
  referral: ReferralEmailData
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const firstName = getFirstName(submitter.fullName);

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Thank you for submitting a referral through Proclusive. We've received it and our team is reviewing the details.</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 16px;">Referral Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6a6d78; width: 120px;">Reference:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.referralId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Project Type:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.projectType}</td>
        </tr>
        ${referral.valueRange ? `
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Estimated Value:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.valueRange}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Status:</td>
          <td style="padding: 8px 0; color: #c9a962; font-weight: 600;">Submitted</td>
        </tr>
      </table>
    </div>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Once we match your referral with the right member, you'll receive an update. You can track progress anytime in your dashboard:</p>

    ${ctaButton('View Dashboard', `${APP_URL}/dashboard/referrals`)}

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Thank you for strengthening the network.</p>
  `;

  const msg = {
    to: submitter.email,
    from: FROM_EMAIL,
    subject: `Referral Submitted — ${referral.referralId}`,
    html: emailWrapper(content),
    text: `Hi ${firstName},

Thank you for submitting a referral through Proclusive. We've received it and our team is reviewing the details.

Referral Summary:
- Reference: ${referral.referralId}
- Project Type: ${referral.projectType}
${referral.valueRange ? `- Estimated Value: ${referral.valueRange}` : ''}
- Status: Submitted

Once we match your referral with the right member, you'll receive an update. You can track progress anytime in your dashboard: ${APP_URL}/dashboard/referrals

Thank you for strengthening the network.

Warm regards,
The Proclusive Team`,
  };

  try {
    await sgMail.send(msg);
    console.log('Referral submitted confirmation email sent to:', submitter.email);
    return true;
  } catch (error) {
    console.error('Failed to send referral submitted confirmation:', error);
    return false;
  }
}

// ============================================
// 3.2 NEW REFERRAL SUBMITTED (ADMIN)
// ============================================
export async function sendNewReferralNotification(
  referral: ReferralEmailData,
  submitter: SubmitterInfo
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">New referral submitted and ready for review.</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 16px;">Referral Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6a6d78; width: 120px;">Reference:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.referralId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Submitted by:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${submitter.fullName} (${submitter.companyName})</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Project Type:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.projectType}</td>
        </tr>
        ${referral.valueRange ? `
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Estimated Value:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.valueRange}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Location:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.location}</td>
        </tr>
      </table>
    </div>

    ${ctaButton('Review Referral', `${APP_URL}/admin/referrals`)}
  `;

  const msg = {
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `New Referral: ${referral.referralId} — ${referral.projectType}`,
    html: emailWrapper(content),
    text: `New referral submitted and ready for review.

Referral Details:
- Reference: ${referral.referralId}
- Submitted by: ${submitter.fullName} (${submitter.companyName})
- Project Type: ${referral.projectType}
${referral.valueRange ? `- Estimated Value: ${referral.valueRange}` : ''}
- Location: ${referral.location}

Review Referral: ${APP_URL}/admin/referrals`,
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

// ============================================
// 3.3 GREAT NEWS! YOU HAVE A REFERRAL
// ============================================
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

  const firstName = getFirstName(member.fullName);

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">A new project opportunity has been matched to you through Proclusive.</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 16px;">Project Overview</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6a6d78; width: 120px;">Reference:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.referralId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Project Type:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.projectType}</td>
        </tr>
        ${referral.valueRange ? `
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Estimated Value:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.valueRange}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Location:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.location}</td>
        </tr>
      </table>
    </div>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Log in to view full details and respond:</p>

    ${ctaButton('View Referral Details', `${APP_URL}/dashboard/referrals`)}

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">We recommend reaching out promptly—quality referrals move quickly.</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Best of luck with this opportunity.</p>
  `;

  const msg = {
    to: member.email,
    from: FROM_EMAIL,
    subject: 'Great News — You Have a Referral',
    html: emailWrapper(content),
    text: `Hi ${firstName},

A new project opportunity has been matched to you through Proclusive.

Project Overview:
- Reference: ${referral.referralId}
- Project Type: ${referral.projectType}
${referral.valueRange ? `- Estimated Value: ${referral.valueRange}` : ''}
- Location: ${referral.location}

Log in to view full details and respond: ${APP_URL}/dashboard/referrals

We recommend reaching out promptly—quality referrals move quickly.

Best of luck with this opportunity.

Warm regards,
The Proclusive Team`,
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

// ============================================
// 3.4 REFERRAL STATUS UPDATE
// ============================================
export async function sendReferralStatusUpdate(
  member: MatchedMemberInfo,
  referral: ReferralEmailData,
  currentStage: 'reviewed' | 'matched' | 'engaged',
  updateDate: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const firstName = getFirstName(member.fullName);

  const stageMessages: Record<string, string> = {
    reviewed: 'Your referral has been verified and is being matched with the right member.',
    matched: 'A qualified member has been connected with this opportunity.',
    engaged: 'Active discussions are underway between the member and the client.',
  };

  const stageLabels: Record<string, string> = {
    reviewed: 'Reviewed',
    matched: 'Matched',
    engaged: 'Engaged',
  };

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Your referral has moved to a new stage.</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 16px;">Current Status</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6a6d78; width: 120px;">Reference:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.referralId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Stage:</td>
          <td style="padding: 8px 0; color: #c9a962; font-weight: 600;">${stageLabels[currentStage]}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Updated:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${updateDate}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: rgba(201, 169, 98, 0.1); padding: 16px 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #c9a962;">
      <p style="color: #f8f8fa; font-size: 14px; line-height: 1.6; margin: 0;">${stageMessages[currentStage]}</p>
    </div>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Track all activity in your dashboard:</p>

    ${ctaButton('View Dashboard', `${APP_URL}/dashboard/referrals`)}
  `;

  const msg = {
    to: member.email,
    from: FROM_EMAIL,
    subject: `Referral Update — ${referral.referralId}`,
    html: emailWrapper(content),
    text: `Hi ${firstName},

Your referral has moved to a new stage.

Current Status:
- Reference: ${referral.referralId}
- Stage: ${stageLabels[currentStage]}
- Updated: ${updateDate}

${stageMessages[currentStage]}

Track all activity in your dashboard: ${APP_URL}/dashboard/referrals

Warm regards,
The Proclusive Team`,
  };

  try {
    await sgMail.send(msg);
    console.log('Referral status update email sent to:', member.email);
    return true;
  } catch (error) {
    console.error('Failed to send referral status update:', error);
    return false;
  }
}

// ============================================
// 3.5 REFERRAL COMPLETED
// ============================================
export async function sendReferralCompleted(
  member: MatchedMemberInfo,
  referral: ReferralEmailData,
  finalValue: string,
  completionDate: string
): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid API key not configured - skipping email notification');
    return false;
  }

  const firstName = getFirstName(member.fullName);

  const content = `
    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Hi ${firstName},</p>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Great news—your referral has been successfully completed.</p>

    <div style="background-color: #252833; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.2);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 16px;">Final Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6a6d78; width: 120px;">Reference:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.referralId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Project Type:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${referral.projectType}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Final Value:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${finalValue}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6a6d78;">Closed:</td>
          <td style="padding: 8px 0; color: #f8f8fa;">${completionDate}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: rgba(201, 169, 98, 0.1); padding: 20px; border-radius: 8px; margin: 24px 0; border: 1px solid rgba(201, 169, 98, 0.3);">
      <h3 style="margin-top: 0; color: #c9a962; font-size: 16px; margin-bottom: 8px;">We'd love your feedback.</h3>
      <p style="color: #b0b2bc; font-size: 14px; line-height: 1.6; margin: 0;">How did this referral go? Your input helps us improve the matching process and build success stories for the network.</p>
      <p style="color: #b0b2bc; font-size: 14px; line-height: 1.6; margin: 12px 0 0 0;">Reply to this email or send your thoughts to: <a href="mailto:feedback@proclusive.com" style="color: #c9a962; text-decoration: none;">feedback@proclusive.com</a></p>
    </div>

    <p style="color: #b0b2bc; line-height: 1.7; font-size: 15px;">Thank you for being part of a network built on trust.</p>
  `;

  const msg = {
    to: member.email,
    from: FROM_EMAIL,
    subject: `Referral Closed — ${referral.referralId}`,
    html: emailWrapper(content),
    text: `Hi ${firstName},

Great news—your referral has been successfully completed.

Final Summary:
- Reference: ${referral.referralId}
- Project Type: ${referral.projectType}
- Final Value: ${finalValue}
- Closed: ${completionDate}

We'd love your feedback.

How did this referral go? Your input helps us improve the matching process and build success stories for the network.

Reply to this email or send your thoughts to: feedback@proclusive.com

Thank you for being part of a network built on trust.

Warm regards,
The Proclusive Team`,
  };

  try {
    await sgMail.send(msg);
    console.log('Referral completed email sent to:', member.email);
    return true;
  } catch (error) {
    console.error('Failed to send referral completed notification:', error);
    return false;
  }
}
