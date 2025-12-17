"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle } from "lucide-react";

interface Step3Props {
  onComplete: (accepted: boolean) => void;
  onBack: () => void;
  initialAccepted: boolean;
}

export default function Step3TermsOfService({ onComplete, onBack, initialAccepted }: Step3Props) {
  const [accepted, setAccepted] = useState(initialAccepted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accepted) {
      alert("You must accept the Terms of Service to continue.");
      return;
    }

    onComplete(accepted);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-[24px] font-semibold text-[#f8f8fa] mb-2">Terms of Service</h2>
        <p className="text-[14px] text-[#b0b2bc]">
          Please review and accept the terms to continue
        </p>
      </div>

      {/* Terms Content */}
      <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-[18px] font-semibold text-[#f8f8fa]">Proclusive Platform Terms of Service</CardTitle>
          </div>
          <CardDescription className="text-[13px] text-[#b0b2bc]">Last Updated: January 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto pr-4 space-y-4 border border-[rgba(255,255,255,0.08)] rounded-lg p-4 bg-[#1a1d27]">
            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">1. Acceptance of Terms</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                By accessing and using the Proclusive platform, you agree to be bound by these Terms of
                Service and all applicable laws and regulations. If you do not agree with any of these
                terms, you are prohibited from using or accessing this platform.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">2. Membership & Verification</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Proclusive operates a curated, high-trust network. All members must:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li>Provide accurate and complete information during the vetting process</li>
                <li>Maintain current licenses, insurance, and regulatory compliance</li>
                <li>Notify Proclusive immediately of any changes to verification documents</li>
                <li>Cooperate with periodic re-verification as required</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">3. Referral System</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Members may submit and receive B2B referrals through the platform. By participating:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li>You agree to provide accurate project and client information</li>
                <li>You understand that referrals are not guarantees of awarded work</li>
                <li>You agree to the commission structure (3% {`<`}$25K, 2% $25K-$100K, 1% {`>`}$100K)</li>
                <li>You will report project outcomes honestly for commission calculation</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">4. Code of Conduct</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                All members must:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li>Conduct business professionally and ethically</li>
                <li>Respect confidentiality of client and member information</li>
                <li>Not circumvent the platform to avoid commission payments</li>
                <li>Not misrepresent credentials, capabilities, or project outcomes</li>
                <li>Not engage in fraudulent or deceptive practices</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">5. Data Privacy & Security</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Proclusive takes data security seriously. We:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li>Implement industry-standard security measures (RLS, encryption)</li>
                <li>Use member data only for platform operations and verification</li>
                <li>Do not sell or share member data with third parties without consent</li>
                <li>Allow members to request data deletion upon account termination</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">6. Limitation of Liability</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Proclusive is a referral platform and does not:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li>Guarantee the quality, timeliness, or outcome of member services</li>
                <li>Assume liability for project disputes between members and clients</li>
                <li>Warrant that all member information is 100% accurate at all times</li>
                <li>Accept responsibility for independent contractor relationships</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">7. Termination</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Proclusive reserves the right to suspend or terminate membership for:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent activity or misrepresentation</li>
                <li>Failure to maintain required verification standards</li>
                <li>Non-payment of commissions or platform fees</li>
                <li>Conduct detrimental to the network's reputation</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">8. Governing Law</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                These Terms shall be governed by the laws of the District of Columbia, without regard
                to its conflict of law provisions.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">9. Changes to Terms</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Proclusive may update these Terms at any time. Continued use of the platform after
                changes constitutes acceptance of the new Terms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance Checkbox */}
      <Card className="bg-[#21242f] border-[rgba(201,169,98,0.2)]">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accept-terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[rgba(255,255,255,0.2)] bg-[#21242f] text-[#c9a962] focus:ring-[#c9a962]"
            />
            <Label htmlFor="accept-terms" className="text-[14px] text-[#b0b2bc] cursor-pointer">
              I have read and agree to the Proclusive Terms of Service. I certify that all
              information provided is accurate and complete. I understand that misrepresentation
              may result in immediate termination from the network.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
        <Button type="button" variant="outline" onClick={onBack} className="h-10 text-[14px]">
          Back
        </Button>
        <Button type="submit" variant="default" disabled={!accepted} className="h-10 text-[14px] bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27] disabled:bg-[rgba(201,169,98,0.3)]">
          Continue to Review
        </Button>
      </div>
    </form>
  );
}
