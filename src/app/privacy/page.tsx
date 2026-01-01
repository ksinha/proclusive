"use client";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen" style={{ background: '#1a1d27' }}>
      {/* Header Section */}
      <section className="relative pt-24 pb-12">
        {/* Decorative top gold line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/30 to-transparent"></div>

        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4">
            <h1
              className="text-[36px] md:text-[48px] font-light text-[#f8f8fa] leading-tight tracking-[0.02em]"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Privacy Policy
            </h1>
            <p className="text-[14px] text-[#6a6d78] font-light">
              Last updated: January 1, 2026
            </p>
          </div>
        </div>

        {/* Bottom border accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/20 to-transparent"></div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div
            className="rounded-2xl p-8 md:p-12 relative overflow-hidden"
            style={{
              background: '#252833',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Corner accents */}
            <div className="absolute top-4 left-4 w-8 h-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#c9a962]/30 to-transparent"></div>
              <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[#c9a962]/30 to-transparent"></div>
            </div>
            <div className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#c9a962]/30 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-[#c9a962]/30 to-transparent"></div>
            </div>

            {/* Scrollable Content */}
            <div className="prose prose-invert max-w-none privacy-content">
              {/* Title */}
              <h2
                className="text-[24px] md:text-[28px] font-light text-[#f8f8fa] mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Proclusive Privacy Policy
              </h2>
              <p className="text-[14px] text-[#b0b2bc] mb-1">
                <strong className="text-[#f8f8fa]">Effective Date:</strong> January 1, 2026
              </p>
              <p className="text-[14px] text-[#b0b2bc] mb-8">
                <strong className="text-[#f8f8fa]">Last Updated:</strong> January 1, 2026
              </p>

              {/* Section 1 */}
              <Section number="1" title="Introduction">
                <p>
                  Chalo Enterprises LLC, doing business as Proclusive (&quot;Proclusive,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), is committed to protecting the privacy of our Members and visitors. This Privacy Policy describes how we collect, use, disclose, and protect your personal information when you use the Proclusive platform (the &quot;Platform&quot;), our Vetting-as-a-Service&trade; (VaaS&trade;) verification services, and related services.
                </p>
                <p>
                  By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our privacy practices, please do not use the Platform.
                </p>
                <p>
                  This Privacy Policy should be read in conjunction with our Terms of Service, which govern your use of the Platform.
                </p>
              </Section>

              {/* Section 2 */}
              <Section number="2" title="Information We Collect">
                <p>
                  We collect information in several ways: directly from you, automatically through your use of the Platform, and from third-party sources.
                </p>

                <SubSection number="2.1" title="Information You Provide">
                  <SubSubSection title="Account and Profile Information:">
                    <BulletList items={[
                      "Full name and contact information (email address, phone number, mailing address)",
                      "Business name, structure, and contact information",
                      "Professional title and role",
                      "Username and password",
                      "Profile photo and business logo",
                      "Professional biography and service descriptions"
                    ]} />
                  </SubSubSection>

                  <SubSubSection title="Vetting and Verification Information:">
                    <BulletList items={[
                      "Professional licenses and certifications (license numbers, issuing authorities, expiration dates)",
                      "Insurance certificates (general liability, workers' compensation, professional liability)",
                      "Bonding documentation",
                      "Business registration documents",
                      "Professional references and work history",
                      "Portfolio materials and project examples",
                      "Safety certifications and training records",
                      "Background check authorization and results"
                    ]} />
                  </SubSubSection>

                  <SubSubSection title="Referral and Transaction Information:">
                    <BulletList items={[
                      "Referral submissions and project descriptions",
                      "Client contact information (when submitted for referrals)",
                      "Project values and outcomes",
                      "Commission and payment information",
                      "Feedback and ratings"
                    ]} />
                  </SubSubSection>

                  <SubSubSection title="Payment Information:">
                    <BulletList items={[
                      "Billing name and address",
                      "Payment method details (processed through secure third-party payment processors)",
                      "Transaction history"
                    ]} />
                  </SubSubSection>

                  <SubSubSection title="Communications:">
                    <BulletList items={[
                      "Messages sent through the Platform",
                      "Customer support inquiries and correspondence",
                      "Survey responses and feedback"
                    ]} />
                  </SubSubSection>
                </SubSection>

                <SubSection number="2.2" title="Information Collected Automatically">
                  <p>When you access or use the Platform, we automatically collect certain information:</p>
                  <BulletList items={[
                    "Device Information: Device type, operating system, browser type and version, unique device identifiers",
                    "Log Information: IP address, access times, pages viewed, referring URL, actions taken on the Platform",
                    "Location Information: General location based on IP address; precise location only with your explicit consent",
                    "Usage Information: Features used, search queries, referral activity, time spent on Platform"
                  ]} />
                </SubSection>

                <SubSection number="2.3" title="Information from Third Parties">
                  <p>We may receive information about you from third-party sources, including:</p>
                  <BulletList items={[
                    "Verification Services: License verification databases, insurance verification services, background check providers",
                    "Professional Associations: Membership status and standing with industry organizations",
                    "Public Records: Business registrations, court records, regulatory filings",
                    "References: Information provided by professional references you have authorized us to contact",
                    "Other Members: Feedback, ratings, and referral information submitted by other Members"
                  ]} />
                </SubSection>
              </Section>

              {/* Section 3 */}
              <Section number="3" title="How We Use Your Information">
                <p>We use the information we collect for the following purposes:</p>

                <SubSection number="3.1" title="Platform Operations">
                  <BulletList items={[
                    "Creating and managing your account",
                    "Processing membership applications and renewals",
                    "Facilitating referrals between Members",
                    "Processing payments and commissions",
                    "Providing customer support"
                  ]} />
                </SubSection>

                <SubSection number="3.2" title="Vetting-as-a-Service\u2122 (VaaS\u2122)">
                  <BulletList items={[
                    "Conducting our proprietary verification process to validate professional credentials and business standing",
                    "Maintaining verification records and conducting periodic re-verification as determined by Proclusive"
                  ]} />
                </SubSection>

                <SubSection number="3.3" title="Communication">
                  <BulletList items={[
                    "Sending transactional emails (referral notifications, payment confirmations)",
                    "Providing Platform updates and announcements",
                    "Sending marketing communications (with your consent, where required)",
                    "Responding to inquiries and support requests"
                  ]} />
                </SubSection>

                <SubSection number="3.4" title="Platform Improvement">
                  <BulletList items={[
                    "Analyzing usage patterns to improve Platform functionality and develop new features",
                    "Conducting research and analytics to enhance service quality"
                  ]} />
                </SubSection>

                <SubSection number="3.5" title="Security and Compliance">
                  <BulletList items={[
                    "Protecting the Platform and Members from fraud and abuse",
                    "Enforcing our Terms of Service",
                    "Complying with legal obligations",
                    "Responding to legal requests and preventing harm"
                  ]} />
                </SubSection>
              </Section>

              {/* Section 4 */}
              <Section number="4" title="How We Share Your Information">
                <p>We do not sell your personal information. We may share your information in the following circumstances:</p>

                <SubSection number="4.1" title="With Other Members">
                  <p>To facilitate referrals, we share certain information with other Members, including:</p>
                  <BulletList items={[
                    "Business name and contact information",
                    "Professional credentials and verification status",
                    "Service areas and specializations",
                    "Ratings and feedback from other Members",
                    "Referral-specific project information"
                  ]} />
                </SubSection>

                <SubSection number="4.2" title="With Service Providers">
                  <p>We share information with third-party service providers who perform services on our behalf, including:</p>
                  <BulletList items={[
                    "Cloud hosting and data storage providers",
                    "Payment processors",
                    "Email and communication service providers",
                    "Analytics providers",
                    "Customer support tools"
                  ]} />
                  <p>These service providers are contractually obligated to protect your information and may only use it to provide services to us.</p>
                </SubSection>

                <SubSection number="4.3" title="With Verification Partners">
                  <p>To conduct our VaaS&trade; verification process, we share information with:</p>
                  <BulletList items={[
                    "License verification databases and state licensing boards",
                    "Insurance verification services",
                    "Background check providers (with your authorization)",
                    "Professional association databases"
                  ]} />
                </SubSection>

                <SubSection number="4.4" title="For Legal and Safety Purposes">
                  <p>We may disclose your information when we believe it is necessary to:</p>
                  <BulletList items={[
                    "Comply with applicable law, regulation, legal process, or governmental request",
                    "Enforce our Terms of Service or other agreements",
                    "Protect the rights, property, or safety of Proclusive, our Members, or others",
                    "Detect, prevent, or address fraud, security, or technical issues",
                    "Report suspected illegal activity to law enforcement or licensing authorities"
                  ]} />
                </SubSection>

                <SubSection number="4.5" title="Business Transfers">
                  <p>
                    If Proclusive is involved in a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change and any choices you may have regarding your information.
                  </p>
                </SubSection>

                <SubSection number="4.6" title="With Your Consent">
                  <p>We may share your information for other purposes with your explicit consent.</p>
                </SubSection>
              </Section>

              {/* Section 5 */}
              <Section number="5" title="Data Security">
                <p>We implement industry-standard security measures to protect your personal information, including:</p>
                <BulletList items={[
                  "Encryption: Data is encrypted in transit (TLS/SSL) and at rest",
                  "Access Controls: Technical and administrative controls ensure Members can only access authorized data",
                  "Authentication: Secure authentication protocols and password requirements",
                  "Monitoring: Regular security monitoring and vulnerability assessments",
                  "Employee Training: Staff training on data protection and privacy practices"
                ]} />
                <p>
                  While we strive to protect your information, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security, and you use the Platform at your own risk.
                </p>
              </Section>

              {/* Section 6 */}
              <Section number="6" title="Data Retention">
                <p>
                  We retain your personal information for as long as necessary to fulfill the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
                <BulletList items={[
                  "Active Membership: We retain your information throughout your membership",
                  "Post-Termination: Verification documents and transaction records are retained for seven (7) years after membership termination for compliance, legal, and audit purposes",
                  "Communications: Support correspondence is retained for three (3) years",
                  "Analytics Data: Aggregated, anonymized data may be retained indefinitely"
                ]} />
              </Section>

              {/* Section 7 */}
              <Section number="7" title="Your Rights and Choices">
                <SubSection number="7.1" title="Access and Correction">
                  <p>
                    You may access and update most of your account information directly through your Platform profile. For information you cannot access directly, contact us at privacy@proclusive.com.
                  </p>
                </SubSection>

                <SubSection number="7.2" title="Data Portability">
                  <p>
                    You may request a copy of your personal information in a commonly used, machine-readable format.
                  </p>
                </SubSection>

                <SubSection number="7.3" title="Deletion">
                  <p>You may request deletion of your personal information by contacting us. Please note that we may retain certain information as required by law or for legitimate business purposes, including:</p>
                  <BulletList items={[
                    "Transaction and commission records",
                    "Information necessary to comply with legal obligations",
                    "Information necessary to resolve disputes or enforce agreements"
                  ]} />
                </SubSection>

                <SubSection number="7.4" title="Marketing Communications">
                  <p>You may opt out of marketing communications by:</p>
                  <BulletList items={[
                    'Clicking the "unsubscribe" link in any marketing email',
                    "Updating your communication preferences in your account settings",
                    "Contacting us at privacy@proclusive.com"
                  ]} />
                  <p>
                    Please note that you cannot opt out of transactional communications related to your account and Platform activity.
                  </p>
                </SubSection>

                <SubSection number="7.5" title="Do Not Track">
                  <p>
                    Our Platform does not currently respond to &quot;Do Not Track&quot; browser signals. However, you can manage cookies and tracking through your browser settings.
                  </p>
                </SubSection>
              </Section>

              {/* Section 8 */}
              <Section number="8" title="Cookies and Tracking Technologies">
                <p>We use cookies and similar tracking technologies to collect information about your use of the Platform.</p>

                <SubSection number="8.1" title="Types of Cookies">
                  <BulletList items={[
                    "Essential Cookies: Required for Platform functionality, authentication, and security",
                    "Performance Cookies: Help us understand how visitors use the Platform",
                    "Functionality Cookies: Remember your preferences and settings",
                    "Analytics Cookies: Provide aggregated data about Platform usage"
                  ]} />
                </SubSection>

                <SubSection number="8.2" title="Managing Cookies">
                  <p>
                    Most web browsers allow you to manage cookie preferences. You can set your browser to refuse cookies or delete certain cookies. Please note that disabling cookies may affect Platform functionality.
                  </p>
                </SubSection>
              </Section>

              {/* Section 9 */}
              <Section number="9" title="Third-Party Links and Services">
                <p>
                  The Platform may contain links to third-party websites or services. This Privacy Policy does not apply to those third-party services, and we are not responsible for their privacy practices. We encourage you to review the privacy policies of any third-party services you access.
                </p>
              </Section>

              {/* Section 10 */}
              <Section number="10" title="Children's Privacy">
                <p>
                  The Platform is intended for use by business professionals and is not directed at children under the age of 18. We do not knowingly collect personal information from children. If we learn that we have collected personal information from a child, we will delete that information promptly.
                </p>
              </Section>

              {/* Section 11 */}
              <Section number="11" title="International Data Transfers">
                <p>
                  Proclusive is based in the United States, and your information is processed and stored in the United States. If you access the Platform from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States, where data protection laws may differ from those in your jurisdiction.
                </p>
                <p>
                  By using the Platform, you consent to the transfer of your information to the United States.
                </p>
              </Section>

              {/* Section 12 */}
              <Section number="12" title="State-Specific Privacy Rights">
                <SubSection number="12.1" title="California Residents">
                  <p>If you are a California resident, you may have additional rights under the California Consumer Privacy Act (CCPA), including:</p>
                  <BulletList items={[
                    "The right to know what personal information we collect, use, and disclose",
                    "The right to request deletion of your personal information",
                    "The right to opt out of the sale of personal information (we do not sell personal information)",
                    "The right to non-discrimination for exercising your privacy rights"
                  ]} />
                  <p>To exercise these rights, contact us at privacy@proclusive.com.</p>
                </SubSection>

                <SubSection number="12.2" title="Virginia, Colorado, Connecticut, and Utah Residents">
                  <p>
                    Residents of these states may have similar rights under applicable state privacy laws. Contact us to exercise your rights.
                  </p>
                </SubSection>
              </Section>

              {/* Section 13 */}
              <Section number="13" title="Changes to This Privacy Policy">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of material changes by:
                </p>
                <BulletList items={[
                  'Posting the updated Privacy Policy on the Platform with a new "Last Updated" date',
                  "Sending an email notification to your registered email address",
                  "Providing a notice through the Platform"
                ]} />
                <p>
                  Your continued use of the Platform after the effective date of any changes constitutes acceptance of the updated Privacy Policy.
                </p>
              </Section>

              {/* Section 14 */}
              <Section number="14" title="Contact Us">
                <p>
                  If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(201,169,98,0.08)', border: '1px solid rgba(201,169,98,0.15)' }}>
                  <p className="text-[#f8f8fa] font-medium mb-1">Proclusive (Chalo Enterprises LLC)</p>
                  <p className="text-[#b0b2bc]">Attention: Privacy Inquiries</p>
                  <p className="text-[#b0b2bc]">
                    Email: <a href="mailto:privacy@proclusive.com" className="text-[#c9a962] hover:text-[#dfc07a] transition-colors">privacy@proclusive.com</a>
                  </p>
                </div>
              </Section>

              {/* Final Notice */}
              <div className="mt-12 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-[14px] text-[#f8f8fa] font-medium text-center uppercase tracking-wider">
                  BY USING THE PROCLUSIVE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ AND UNDERSTOOD THIS PRIVACY POLICY.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Helper Components
function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h3
        className="text-[20px] md:text-[22px] font-light text-[#c9a962] mb-4"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        {number}. {title}
      </h3>
      <div className="space-y-4 text-[15px] text-[#b0b2bc] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function SubSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6 mb-4">
      <h4
        className="text-[16px] md:text-[17px] font-medium text-[#f8f8fa] mb-3"
        style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
      >
        {number} {title}
      </h4>
      <div className="space-y-3 text-[15px] text-[#b0b2bc]">
        {children}
      </div>
    </div>
  );
}

function SubSubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 mb-3">
      <p className="text-[15px] text-[#f8f8fa] font-medium mb-2">{title}</p>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-none space-y-2 pl-0">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="text-[#c9a962] mt-[6px] flex-shrink-0">
            <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
              <circle cx="3" cy="3" r="3" />
            </svg>
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
