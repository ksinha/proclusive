"use client";

export default function TermsOfService() {
  return (
    <main className="min-h-screen relative" style={{ backgroundColor: '#1a1d27' }}>
      {/* Blueprint-style Grid Overlay */}
      <div
        className="fixed top-0 left-0 w-full h-full z-[1] pointer-events-none max-md:opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 169, 98, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.045) 1px, transparent 1px),
            linear-gradient(rgba(201, 169, 98, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: 'center center',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
        }}
      ></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1
            className="text-[36px] md:text-[48px] font-light tracking-[0.02em] mb-4"
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              color: '#f8f8fa'
            }}
          >
            Terms of Service
          </h1>
          <p
            className="text-[14px] font-light"
            style={{ color: '#6a6d78' }}
          >
            Last updated: December 31, 2025
          </p>
        </div>

        {/* Content Card */}
        <div
          className="rounded-2xl p-8 md:p-12"
          style={{
            backgroundColor: '#252833',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          {/* Scrollable Content Area */}
          <div
            className="prose prose-invert max-w-none"
            style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              paddingRight: '16px'
            }}
          >
            {/* TOS Title */}
            <h2
              className="text-[24px] md:text-[28px] font-light mb-2"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                color: '#c9a962'
              }}
            >
              Proclusive Platform Terms of Service
            </h2>
            <p className="text-[14px] mb-8" style={{ color: '#b0b2bc' }}>
              Effective Date: February 1, 2026
            </p>

            {/* Section 1 */}
            <Section number="1" title="Acceptance of Terms">
              <p>
                By accessing, registering for, or using the Proclusive platform (the "Platform"), you ("Member," "you," or "your") agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable laws and regulations. These Terms constitute a legally binding agreement between you and Chalo Enterprises LLC, doing business as Proclusive ("Proclusive," "we," "us," or "our").
              </p>
              <p>
                If you do not agree with any provision of these Terms, you must not access or use the Platform. Your continued use of the Platform following the posting of any changes to these Terms constitutes acceptance of those changes.
              </p>
              <p>
                Proclusive reserves the right to refuse service to anyone for any reason at any time.
              </p>
            </Section>

            {/* Section 2 */}
            <Section number="2" title="Platform Description">
              <p>
                Proclusive is an exclusive, Members-only business-to-business (B2B) referral network and Vetting-as-a-Service (VaaS) platform designed for professionals in the construction and built-environment sector. The Platform facilitates verified professional referrals among vetted Members and provides verification services to enhance trust and quality within the network.
              </p>
              <p>
                Proclusive is not a contractor, subcontractor, employer, or employment agency. The Platform serves solely as a referral facilitation service and does not participate in, supervise, or control any work performed by Members.
              </p>
            </Section>

            {/* Section 3 */}
            <Section number="3" title="Membership Eligibility and Verification">
              <SubSection number="3.1" title="Eligibility Requirements">
                <p>Membership in Proclusive is by invitation only. To be eligible for membership, you must:</p>
                <BulletList items={[
                  "Be a licensed professional or registered business entity operating in the construction or built-environment sector",
                  "Maintain all required licenses, permits, and certifications for your jurisdiction and trade",
                  "Carry adequate insurance coverage as required by applicable law and industry standards",
                  "Be in good standing with relevant regulatory bodies and professional associations",
                  "Have the legal authority to bind yourself or your organization to these Terms"
                ]} />
              </SubSection>

              <SubSection number="3.2" title="Vetting-as-a-Service (VaaS) Verification Process">
                <p>Proclusive operates a proprietary multi-factor verification process to maintain the integrity of our network. As a Member, you agree to:</p>
                <BulletList items={[
                  "Provide accurate, complete, and truthful information during the verification process and at all times thereafter",
                  "Submit all documentation requested by Proclusive as part of the verification process",
                  "Notify Proclusive within five (5) business days of any material changes to your credentials, insurance coverage, or business status",
                  "Cooperate with periodic re-verification as required by Proclusive",
                  "Consent to Proclusive's verification of submitted information through third-party sources"
                ]} />
              </SubSection>

              <SubSection number="3.3" title="Consequences of False Information">
                <p>Providing false, misleading, or incomplete information during the vetting process or at any time during your membership constitutes a material breach of these Terms and may result in:</p>
                <BulletList items={[
                  "Immediate suspension or termination of membership without refund",
                  "Forfeiture of any pending commissions or referral fees",
                  "Reporting to relevant licensing boards or regulatory authorities",
                  "Legal action to recover damages"
                ]} />
              </SubSection>
            </Section>

            {/* Section 4 */}
            <Section number="4" title="Referral System">
              <SubSection number="4.1" title="Referral Workflow">
                <p>The Proclusive referral system operates through a structured five-stage workflow:</p>
                <BulletList items={[
                  "SUBMITTED: Member submits a qualified referral with accurate project and client information.",
                  "REVIEWED: Proclusive administrators verify referral quality and completeness.",
                  "MATCHED: Referral is routed to appropriate Member(s) based on qualifications, capacity, and fit.",
                  "ENGAGED: Receiving Member actively pursues the opportunity through negotiation and proposal.",
                  "COMPLETED: Project is closed with outcome reporting and feedback loop completion."
                ]} />
              </SubSection>

              <SubSection number="4.2" title="Member Obligations">
                <p>By participating in the referral system, you agree to:</p>
                <BulletList items={[
                  "Provide accurate and complete project and client information when submitting referrals",
                  "Respond to matched referrals within the timeframes established by Proclusive",
                  "Report project outcomes honestly and within thirty (30) days of project completion or termination",
                  "Not circumvent the Platform to avoid commission payments for referrals originated through Proclusive",
                  "Acknowledge that referrals are opportunities, not guarantees of awarded work"
                ]} />
              </SubSection>

              <SubSection number="4.3" title="Commission Structure">
                <p>
                  The standard commission on successfully completed referrals is 2.5% of total project value, allocated as 2.0% to the referring Member and 0.5% to Proclusive as an administrative fee.
                </p>
                <p>
                  <strong style={{ color: '#f8f8fa' }}>Custom Commissions:</strong> Members may specify a custom referral fee (flat amount or alternative percentage) when submitting a referral. Custom arrangements replace only the Member's portion; the 0.5% Proclusive administrative fee applies to all referrals regardless of custom terms.
                </p>
                <p>
                  <strong style={{ color: '#f8f8fa' }}>Negotiated Arrangements:</strong> For projects exceeding $100,000 or other special circumstances, alternative structures may be established in writing at Proclusive's sole discretion.
                </p>
                <p>
                  Commissions are due within thirty (30) days of project completion or final payment receipt, whichever occurs first.
                </p>
              </SubSection>

              <SubSection number="4.4" title="Commission Disputes">
                <p>In the event of a dispute regarding commission calculations or amounts:</p>
                <BulletList items={[
                  "The disputing party must submit a written dispute notice within fifteen (15) business days of receiving the commission statement",
                  "Proclusive will review the dispute and may request supporting documentation from all parties",
                  "Proclusive will issue a determination within thirty (30) days of receiving complete information",
                  "Proclusive's determination shall be final and binding absent manifest error"
                ]} />
              </SubSection>
            </Section>

            {/* Section 5 */}
            <Section number="5" title="Code of Conduct">
              <p style={{ color: '#b0b2bc', marginBottom: '16px' }}>All Members must adhere to the following standards of conduct:</p>

              <SubSection number="5.1" title="Professional Standards">
                <BulletList items={[
                  "Conduct all business professionally, ethically, and in compliance with applicable laws and regulations",
                  "Maintain the quality standards expected of licensed professionals in the construction industry",
                  "Communicate promptly and professionally with clients, other Members, and Proclusive staff"
                ]} />
              </SubSection>

              <SubSection number="5.2" title="Prohibited Conduct">
                <p>Members shall not:</p>
                <BulletList items={[
                  "Misrepresent credentials, capabilities, experience, or project outcomes",
                  "Engage in fraudulent, deceptive, or dishonest practices",
                  "Circumvent the Platform to avoid commission payments, including but not limited to: taking referral relationships offline, direct-dealing after introduction, or misrepresenting project values",
                  "Disclose confidential client or Member information without proper authorization",
                  "Solicit other Members' clients outside the Platform's referral system",
                  "Engage in harassment, discrimination, or other unprofessional behavior toward clients, Members, or Proclusive staff",
                  "Use the Platform for any unlawful purpose or in violation of these Terms"
                ]} />
              </SubSection>
            </Section>

            {/* Section 6 */}
            <Section number="6" title="Fees and Payment">
              <SubSection number="6.1" title="Membership Fees">
                <p>
                  Membership fees are established by Proclusive and communicated to Members at the time of enrollment. Fees are due annually unless otherwise specified. Membership fees are non-refundable except as expressly provided in these Terms.
                </p>
              </SubSection>

              <SubSection number="6.2" title="Commission Payments">
                <p>
                  Commissions are calculated and invoiced according to Section 4.3. Payment is due within thirty (30) days of invoice date. Late payments may incur interest at the rate of 1.5% per month or the maximum rate permitted by law, whichever is lower.
                </p>
              </SubSection>

              <SubSection number="6.3" title="Non-Payment">
                <p>Failure to pay fees or commissions when due may result in:</p>
                <BulletList items={[
                  "Suspension of Platform access and referral privileges",
                  "Termination of membership",
                  "Collection action, with Member responsible for reasonable collection costs and attorney fees"
                ]} />
              </SubSection>
            </Section>

            {/* Section 7 */}
            <Section number="7" title="Intellectual Property">
              <SubSection number="7.1" title="Platform Ownership">
                <p>
                  The Platform, including all software, content, design, graphics, and other materials, is owned by Proclusive or its licensors and is protected by copyright, trademark, and other intellectual property laws. Members may not copy, modify, distribute, or create derivative works based on the Platform without Proclusive's prior written consent.
                </p>
              </SubSection>

              <SubSection number="7.2" title="Trademarks">
                <p>
                  "Proclusive," "Vetting-as-a-Service," "VaaS," and related logos and marks are trademarks of Chalo Enterprises LLC. Members may not use these marks without Proclusive's prior written consent.
                </p>
              </SubSection>

              <SubSection number="7.3" title="Member Content">
                <p>
                  Members retain ownership of content they submit to the Platform. By submitting content, Members grant Proclusive a non-exclusive, royalty-free, worldwide license to use, display, and distribute such content in connection with Platform operations.
                </p>
              </SubSection>

              <SubSection number="7.4" title="Proprietary Methodology">
                <p>
                  Proclusive's verification criteria, matching algorithms, scoring methodologies, referral routing systems, and operational processes constitute confidential proprietary information and trade secrets. Members agree not to disclose, replicate, reverse-engineer, or create derivative works based on any aspect of Proclusive's verification, matching, or referral systems. This obligation survives termination of membership.
                </p>
              </SubSection>
            </Section>

            {/* Section 8 */}
            <Section number="8" title="Data Privacy and Security">
              <SubSection number="8.1" title="Privacy Policy">
                <p>
                  Member data is collected, used, and protected in accordance with our Privacy Policy, which is incorporated by reference into these Terms. By using the Platform, you consent to the data practices described in the Privacy Policy.
                </p>
              </SubSection>

              <SubSection number="8.2" title="Security Measures">
                <p>
                  Proclusive implements industry-standard security measures, including encryption and access controls, to protect Member data. However, no system is completely secure, and Proclusive cannot guarantee absolute security.
                </p>
              </SubSection>

              <SubSection number="8.3" title="Data Sharing">
                <p>Proclusive does not sell Member data to third parties. We may share data with:</p>
                <BulletList items={[
                  "Other Members as necessary to facilitate referrals",
                  "Third-party verification services to validate credentials",
                  "Service providers who assist in Platform operations under confidentiality agreements",
                  "Law enforcement or regulatory authorities when required by law"
                ]} />
              </SubSection>

              <SubSection number="8.4" title="Data Retention">
                <p>
                  Verification documents and Member data are retained for the duration of membership plus seven (7) years for compliance and legal purposes. Members may request data deletion upon account termination, subject to our legal retention obligations.
                </p>
              </SubSection>
            </Section>

            {/* Section 9 */}
            <Section number="9" title="Limitation of Liability">
              <SubSection number="9.1" title="Platform Limitations">
                <p>Proclusive is a referral facilitation platform and does not:</p>
                <BulletList items={[
                  "Guarantee the quality, timeliness, or outcome of any Member's services",
                  "Assume liability for project disputes between Members and clients or between Members",
                  "Warrant that all Member information is accurate or current at all times, despite our verification efforts",
                  "Accept responsibility for independent contractor relationships or employment determinations",
                  "Guarantee that any referral will result in awarded work or revenue"
                ]} />
              </SubSection>

              <SubSection number="9.2" title="Liability Cap">
                <p style={{ color: '#f8f8fa', fontWeight: 500 }}>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, PROCLUSIVE'S TOTAL LIABILITY TO ANY MEMBER FOR ANY CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS OR THE PLATFORM SHALL NOT EXCEED THE TOTAL FEES PAID BY THAT MEMBER TO PROCLUSIVE DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
                </p>
              </SubSection>

              <SubSection number="9.3" title="Exclusion of Damages">
                <p style={{ color: '#f8f8fa', fontWeight: 500 }}>
                  IN NO EVENT SHALL PROCLUSIVE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, REVENUE, BUSINESS OPPORTUNITIES, OR GOODWILL, REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE OR WHETHER PROCLUSIVE WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
                </p>
              </SubSection>
            </Section>

            {/* Section 10 */}
            <Section number="10" title="Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless Proclusive, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorney fees) arising out of or related to:
              </p>
              <BulletList items={[
                "Your use of the Platform",
                "Your breach of these Terms",
                "Your violation of any applicable law or regulation",
                "Your provision of services to clients referred through the Platform",
                "Any dispute between you and another Member or client",
                "Any claim that information you provided is false, misleading, or infringes third-party rights"
              ]} />
            </Section>

            {/* Section 11 */}
            <Section number="11" title="Termination">
              <SubSection number="11.1" title="Termination by Proclusive">
                <p>Proclusive may suspend or terminate your membership immediately and without prior notice for:</p>
                <BulletList items={[
                  "Violation of these Terms of Service",
                  "Fraudulent activity, misrepresentation, or dishonest conduct",
                  "Failure to maintain required verification standards, licenses, or insurance",
                  "Non-payment of fees or commissions",
                  "Conduct detrimental to the network's reputation or integrity",
                  "Circumvention of the Platform to avoid commission payments"
                ]} />
              </SubSection>

              <SubSection number="11.2" title="Termination by Member">
                <p>
                  Members may terminate their membership at any time by providing thirty (30) business days written notice to Proclusive. Membership fees are non-refundable upon voluntary termination.
                </p>
              </SubSection>

              <SubSection number="11.3" title="Effect of Termination">
                <p>Upon termination:</p>
                <BulletList items={[
                  "All outstanding commissions remain due and payable",
                  "Pending referrals in the SUBMITTED, REVIEWED, or MATCHED stages will be cancelled",
                  "Referrals in the ENGAGED stage will continue, with commissions due upon completion",
                  "Your access to the Platform will be revoked",
                  "Provisions regarding indemnification, limitation of liability, proprietary methodology, and governing law survive termination"
                ]} />
              </SubSection>

              <SubSection number="11.4" title="Cure Period">
                <p>
                  For non-material breaches that are curable, Proclusive may, in its sole discretion, provide a fifteen (15) business day cure period before termination. Material breaches, including fraud, misrepresentation, or illegal activity, are not subject to a cure period.
                </p>
              </SubSection>
            </Section>

            {/* Section 12 */}
            <Section number="12" title="Dispute Resolution">
              <SubSection number="12.1" title="Informal Resolution">
                <p>
                  Before initiating formal dispute resolution, parties agree to attempt informal resolution by contacting the other party in writing and engaging in good-faith negotiations for a period of thirty (30) business days.
                </p>
              </SubSection>

              <SubSection number="12.2" title="Mediation">
                <p>
                  If informal resolution is unsuccessful, disputes shall be submitted to mediation before a mutually agreed-upon mediator in the District of Columbia. The costs of mediation shall be shared equally by the parties.
                </p>
              </SubSection>

              <SubSection number="12.3" title="Arbitration">
                <p>
                  If mediation is unsuccessful, disputes shall be resolved by binding arbitration in accordance with the rules of the American Arbitration Association. The arbitration shall take place in the District of Columbia, and the arbitrator's decision shall be final and binding. Judgment on the award may be entered in any court of competent jurisdiction.
                </p>
              </SubSection>

              <SubSection number="12.4" title="Class Action Waiver">
                <p style={{ color: '#f8f8fa', fontWeight: 500 }}>
                  YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.
                </p>
              </SubSection>
            </Section>

            {/* Section 13 */}
            <Section number="13" title="Force Majeure">
              <p>
                Neither party shall be liable for any failure or delay in performance due to circumstances beyond its reasonable control, including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, epidemics, pandemics, strikes, or failures of third-party telecommunications or power supply. The affected party shall provide prompt notice and use reasonable efforts to mitigate the impact.
              </p>
            </Section>

            {/* Section 14 */}
            <Section number="14" title="Governing Law and Jurisdiction">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the District of Columbia, without regard to its conflict of law provisions. Subject to the dispute resolution provisions above, any legal action arising from these Terms shall be brought exclusively in the courts of the District of Columbia, and the parties consent to the personal jurisdiction of such courts.
              </p>
            </Section>

            {/* Section 15 */}
            <Section number="15" title="Modifications to Terms">
              <p>
                Proclusive reserves the right to modify these Terms at any time. We will provide notice of material changes by email or through the Platform at least thirty (30) days before the changes take effect. Your continued use of the Platform after the effective date of any modifications constitutes acceptance of the updated Terms. If you do not agree to the modified Terms, you must discontinue use of the Platform before the effective date.
              </p>
            </Section>

            {/* Section 16 */}
            <Section number="16" title="General Provisions">
              <SubSection number="16.1" title="Entire Agreement">
                <p>
                  These Terms, together with the Privacy Policy and any other agreements expressly incorporated by reference, constitute the entire agreement between you and Proclusive regarding the Platform.
                </p>
              </SubSection>

              <SubSection number="16.2" title="Severability">
                <p>
                  If any provision of these Terms is held to be invalid or unenforceable, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions shall continue in full force and effect.
                </p>
              </SubSection>

              <SubSection number="16.3" title="Waiver">
                <p>
                  No waiver of any term or condition of these Terms shall be deemed a further or continuing waiver of such term or any other term.
                </p>
              </SubSection>

              <SubSection number="16.4" title="Assignment">
                <p>
                  You may not assign or transfer these Terms or your rights hereunder without Proclusive's prior written consent. Proclusive may assign these Terms without restriction.
                </p>
              </SubSection>

              <SubSection number="16.5" title="Notices">
                <p>
                  All notices to Proclusive shall be sent to: Chalo Enterprises LLC, Attention: Legal Department, or by email to legal@proclusive.com. Notices to Members shall be sent to the email address on file.
                </p>
              </SubSection>
            </Section>

            {/* Section 17 */}
            <Section number="17" title="Contact Information">
              <p>For questions about these Terms of Service, please contact:</p>
              <p style={{ color: '#f8f8fa', marginTop: '8px' }}>
                Proclusive (Chalo Enterprises LLC)<br />
                Email: legal@proclusive.com
              </p>
            </Section>

            {/* Final Acknowledgment */}
            <div
              className="mt-12 pt-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p style={{ color: '#f8f8fa', fontWeight: 500, textAlign: 'center' }}>
                BY USING THE PROCLUSIVE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .prose ::-webkit-scrollbar {
          width: 8px;
        }
        .prose ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .prose ::-webkit-scrollbar-thumb {
          background: rgba(201, 169, 98, 0.3);
          border-radius: 4px;
        }
        .prose ::-webkit-scrollbar-thumb:hover {
          background: rgba(201, 169, 98, 0.5);
        }
      `}</style>
    </main>
  );
}

// Section Component
function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3
        className="text-[20px] md:text-[22px] font-light mb-4"
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          color: '#c9a962'
        }}
      >
        {number}. {title}
      </h3>
      <div className="space-y-4 text-[14px] leading-relaxed" style={{ color: '#b0b2bc' }}>
        {children}
      </div>
    </div>
  );
}

// SubSection Component
function SubSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 ml-4">
      <h4
        className="text-[16px] md:text-[18px] font-medium mb-3"
        style={{ color: '#f8f8fa' }}
      >
        {number} {title}
      </h4>
      <div className="space-y-3 text-[14px] leading-relaxed" style={{ color: '#b0b2bc' }}>
        {children}
      </div>
    </div>
  );
}

// BulletList Component
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 ml-4">
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start text-[14px]"
          style={{ color: '#b0b2bc' }}
        >
          <span
            className="mr-3 mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: '#c9a962' }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
