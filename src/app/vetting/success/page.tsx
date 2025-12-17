import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Mail, ChevronRight } from "lucide-react";

export default function VettingSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(34,197,94,0.2)]">
            <CheckCircle className="h-10 w-10 text-[#22c55e]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-[32px] font-semibold text-[#f8f8fa]">
              Application Submitted!
            </h1>
            <p className="text-[16px] text-[#b0b2bc]">
              Welcome to the Proclusive journey
            </p>
          </div>
        </div>

        {/* Thank You Card */}
        <Card hover={false} compact className="bg-[rgba(201,169,98,0.1)] border-[rgba(201,169,98,0.3)]">
          <p className="text-center text-[14px] text-[#b0b2bc]">
            Thank you for applying to join the Proclusive network. Your application has been
            submitted and is now under review by our team.
          </p>
        </Card>

        {/* What Happens Next */}
        <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#c9a962]" />
              <CardTitle className="text-[20px] font-semibold text-[#f8f8fa]">What Happens Next?</CardTitle>
            </div>
            <CardDescription className="text-[14px] text-[#b0b2bc]">Your path to becoming a verified member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c9a962] text-[#1a1d27] font-semibold text-[13px] flex-shrink-0">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[14px] font-medium text-[#f8f8fa]">Document Review</p>
                  <p className="text-[13px] text-[#b0b2bc]">
                    Our admin team will review your documents within 48 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c9a962] text-[#1a1d27] font-semibold text-[13px] flex-shrink-0">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[14px] font-medium text-[#f8f8fa]">Credential Verification</p>
                  <p className="text-[13px] text-[#b0b2bc]">
                    We'll verify your credentials with the appropriate licensing boards
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#c9a962] text-[#1a1d27] font-semibold text-[13px] flex-shrink-0">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[14px] font-medium text-[#f8f8fa]">Email Notification</p>
                  <p className="text-[13px] text-[#b0b2bc]">
                    You'll receive an email notification once your application is approved
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#22c55e] text-[#1a1d27] font-semibold text-[13px] flex-shrink-0">
                  4
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[14px] font-medium text-[#f8f8fa]">Start Networking</p>
                  <p className="text-[13px] text-[#b0b2bc]">
                    After approval, you can start sending and receiving referrals
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="bg-[#21242f] border-[rgba(255,255,255,0.08)]">
          <CardContent className="pt-6 space-y-3">
            <p className="text-[14px] text-[#b0b2bc]">
              Get ready to unlock exclusive benefits once approved:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                <span className="text-[13px] text-[#f8f8fa]">Access verified member directory</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                <span className="text-[13px] text-[#f8f8fa]">Send & receive B2B referrals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                <span className="text-[13px] text-[#f8f8fa]">Earn performance badges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#22c55e]" />
                <span className="text-[13px] text-[#f8f8fa]">Join exclusive network events</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/auth/login" className="block">
            <Button variant="default" className="w-full h-11 text-[14px] bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27]">
              Return to Login
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Card hover={false} compact className="bg-[#21242f] border-[rgba(255,255,255,0.08)] text-center">
            <div className="flex items-center justify-center gap-2 text-[13px] text-[#b0b2bc]">
              <Mail className="h-4 w-4" />
              <span>Questions? Contact us at</span>
              <a href="mailto:support@proclusive.com" className="text-[#c9a962] hover:underline font-medium">
                support@proclusive.com
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
