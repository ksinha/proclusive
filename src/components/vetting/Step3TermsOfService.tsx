"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, Shield } from "lucide-react";
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
        <h2 className="text-[24px] font-semibold text-[#f8f8fa] mb-2">Terms & Privacy</h2>
        <p className="text-[14px] text-[#b0b2bc]">
          Please review and accept our terms to continue
        </p>
      </div>

      {/* Acceptance Checkboxes */}
      <Card className="bg-[#21242f] border-[rgba(201,169,98,0.2)]">
        <CardContent className="pt-6 space-y-6">
          {/* Terms of Service Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accept-terms"
              checked={tosAccepted}
              onChange={(e) => setTosAccepted(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[rgba(255,255,255,0.5)] bg-[#1a1d27] text-[#c9a962] focus:ring-[#c9a962] focus:ring-offset-0 cursor-pointer accent-[#c9a962]"
              style={{
                borderWidth: '2px',
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-[#c9a962]" />
                <span className="text-[14px] font-medium text-[#f8f8fa]">Terms of Service</span>
              </div>
              <Label htmlFor="accept-terms" className="text-[14px] text-[#b0b2bc] cursor-pointer leading-relaxed">
                I have read and agree to the{" "}
                <Link href="/terms" target="_blank" className="text-[#c9a962] hover:text-[#d4b674] underline">
                  Proclusive Terms of Service
                </Link>
                . I certify that all information provided is accurate and complete. I understand that misrepresentation
                may result in immediate termination from the network.
              </Label>
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)]"></div>

          {/* Privacy Policy Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="accept-privacy"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-[rgba(255,255,255,0.5)] bg-[#1a1d27] text-[#c9a962] focus:ring-[#c9a962] focus:ring-offset-0 cursor-pointer accent-[#c9a962]"
              style={{
                borderWidth: '2px',
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="h-4 w-4 text-[#c9a962]" />
                <span className="text-[14px] font-medium text-[#f8f8fa]">Privacy Policy</span>
              </div>
              <Label htmlFor="accept-privacy" className="text-[14px] text-[#b0b2bc] cursor-pointer leading-relaxed">
                I have read and agree to the{" "}
                <Link href="/privacy" target="_blank" className="text-[#c9a962] hover:text-[#d4b674] underline">
                  Privacy Policy
                </Link>
                . I understand how my personal and business information will be collected, used, and protected.
              </Label>
            </div>
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
