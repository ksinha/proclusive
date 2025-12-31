"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

interface Step3Props {
  onComplete: (tosAccepted: boolean, privacyAccepted: boolean) => void;
  onBack: () => void;
  initialTosAccepted: boolean;
  initialPrivacyAccepted: boolean;
}

export default function Step3TermsOfService({ onComplete, onBack, initialTosAccepted, initialPrivacyAccepted }: Step3Props) {
  const [tosAccepted, setTosAccepted] = useState(initialTosAccepted);
  const [privacyAccepted, setPrivacyAccepted] = useState(initialPrivacyAccepted);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tosAccepted) {
      alert("You must accept the Terms of Service to continue.");
      return;
    }

    if (!privacyAccepted) {
      alert("You must accept the Privacy Policy to continue.");
      return;
    }

    onComplete(tosAccepted, privacyAccepted);
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
          <CardDescription className="text-[13px] text-[#b0b2bc]">Last Updated: December 31, 2025 | Effective: February 1, 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto pr-4 space-y-4 border border-[rgba(255,255,255,0.08)] rounded-lg p-4 bg-[#1a1d27]">
            <div className="text-[12px] text-[#c9a962] bg-[rgba(201,169,98,0.1)] px-3 py-2 rounded-md mb-4">
              This is a summary of key terms. For the complete Terms of Service, please visit the{" "}
              <Link href="/terms" target="_blank" className="underline hover:text-[#d4b674]">full terms page</Link>.
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">1. Acceptance of Terms</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                By accessing and using the Proclusive platform, you agree to be bound by these Terms of
                Service and all applicable laws and regulations. If you do not agree with any of these
                terms, you are prohibited from using or accessing this platform. These terms become
                effective February 1, 2026.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">2. Membership Eligibility</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Proclusive operates a curated, high-trust network. Key eligibility requirements:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li>Must be a licensed professional or registered business entity</li>
                <li>Provide accurate and complete information during the vetting process</li>
                <li>Maintain current licenses, insurance, and regulatory compliance</li>
                <li>Cooperate with periodic re-verification as required</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">3. Referral System & Commission</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Members may submit and receive B2B referrals through the platform. Commission structure:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li><span className="text-[#c9a962] font-medium">2.5% total commission</span> on successful referrals</li>
                <li><span className="text-[#f8f8fa]">2.0%</span> paid to the referring Member</li>
                <li><span className="text-[#f8f8fa]">0.5%</span> retained by Proclusive as admin fee</li>
                <li>Custom commissions allowed (replacing Member portion only, 0.5% admin fee always applies)</li>
              </ul>
              <p className="text-[13px] text-[#b0b2bc] mt-2">
                <span className="text-[#f8f8fa] font-medium">Five-Stage Referral Workflow:</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-[11px] px-2 py-1 rounded bg-[rgba(255,255,255,0.08)] text-[#b0b2bc]">SUBMITTED</span>
                <span className="text-[11px] text-[#b0b2bc]">→</span>
                <span className="text-[11px] px-2 py-1 rounded bg-[rgba(255,255,255,0.08)] text-[#b0b2bc]">REVIEWED</span>
                <span className="text-[11px] text-[#b0b2bc]">→</span>
                <span className="text-[11px] px-2 py-1 rounded bg-[rgba(255,255,255,0.08)] text-[#b0b2bc]">MATCHED</span>
                <span className="text-[11px] text-[#b0b2bc]">→</span>
                <span className="text-[11px] px-2 py-1 rounded bg-[rgba(255,255,255,0.08)] text-[#b0b2bc]">ENGAGED</span>
                <span className="text-[11px] text-[#b0b2bc]">→</span>
                <span className="text-[11px] px-2 py-1 rounded bg-[rgba(201,169,98,0.3)] text-[#c9a962]">COMPLETED</span>
              </div>
              <p className="text-[12px] text-[#b0b2bc] mt-2 italic">
                Commission is due only upon COMPLETED status.
              </p>
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
                <li>Report project outcomes honestly for commission calculation</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-[14px] font-semibold text-[#f8f8fa]">5. Limitation of Liability</h4>
              <p className="text-[13px] text-[#b0b2bc]">
                Proclusive is a referral platform and does not:
              </p>
              <ul className="text-[13px] text-[#b0b2bc] space-y-1 list-disc list-inside ml-4">
                <li>Guarantee the quality, timeliness, or outcome of member services</li>
                <li>Assume liability for project disputes between members and clients</li>
                <li>Warrant that all member information is 100% accurate at all times</li>
                <li>Accept responsibility for independent contractor relationships</li>
                <li>Guarantee referral volume, match success, or business outcomes</li>
              </ul>
            </div>

            <div className="text-[12px] text-[#b0b2bc] text-center pt-2 border-t border-[rgba(255,255,255,0.08)]">
              For complete terms including Termination, Governing Law, and Changes to Terms,{" "}
              <Link href="/terms" target="_blank" className="text-[#c9a962] underline hover:text-[#d4b674]">view full Terms of Service</Link>.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance Checkboxes */}
      <Card className="bg-[#21242f] border-[rgba(201,169,98,0.2)]">
        <CardContent className="pt-6 space-y-4">
          {/* Terms of Service Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accept-terms"
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[rgba(255,255,255,0.5)] bg-[#1a1d27] text-[#c9a962] focus:ring-[#c9a962] focus:ring-offset-0 cursor-pointer accent-[#c9a962]"
              style={{
                borderWidth: '2px',
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            />
            <Label htmlFor="accept-terms" className="text-[14px] text-[#e8e9ec] cursor-pointer leading-relaxed">
              I have read and agree to the{" "}
              <Link href="/terms" target="_blank" className="text-[#c9a962] hover:text-[#d4b674] underline">
                Proclusive Terms of Service
              </Link>
              . I certify that all information provided is accurate and complete. I understand that misrepresentation
              may result in immediate termination from the network.
            </Label>
          </div>

          {/* Privacy Policy Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accept-privacy"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-[rgba(255,255,255,0.5)] bg-[#1a1d27] text-[#c9a962] focus:ring-[#c9a962] focus:ring-offset-0 cursor-pointer accent-[#c9a962]"
              style={{
                borderWidth: '2px',
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            />
            <Label htmlFor="accept-privacy" className="text-[14px] text-[#e8e9ec] cursor-pointer leading-relaxed">
              I have read and agree to the{" "}
              <Link href="/privacy" target="_blank" className="text-[#c9a962] hover:text-[#d4b674] underline">
                Privacy Policy
              </Link>
              . I understand how my personal and business information will be collected, used, and protected.
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[rgba(255,255,255,0.08)]">
        <Button type="button" variant="outline" onClick={onBack} className="h-10 text-[14px]">
          Back
        </Button>
        <Button type="submit" variant="default" disabled={!tosAccepted || !privacyAccepted} className="h-10 text-[14px] bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27] disabled:bg-[rgba(201,169,98,0.3)]">
          Continue to Review
        </Button>
      </div>
    </form>
  );
}
