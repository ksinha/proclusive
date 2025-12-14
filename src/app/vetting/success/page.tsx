import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Mail, Award, ChevronRight } from "lucide-react";

export default function VettingSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-[32px] font-semibold text-gray-900">
              Application Submitted!
            </h1>
            <p className="text-[16px] text-gray-600">
              Welcome to the Proclusive journey
            </p>
          </div>
        </div>

        {/* Thank You Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-center text-[14px] text-blue-900">
              Thank you for applying to join the Proclusive network. Your application has been
              submitted and is now under review by our team.
            </p>
          </CardContent>
        </Card>

        {/* What Happens Next */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-[20px] font-semibold text-gray-900">What Happens Next?</CardTitle>
            </div>
            <CardDescription className="text-[14px] text-gray-600">Your path to becoming a verified member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-[13px] flex-shrink-0">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[14px] font-medium text-gray-900">Document Review</p>
                  <p className="text-[13px] text-gray-600">
                    Our admin team will review your documents within 48 hours
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-[13px] flex-shrink-0">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[14px] font-medium text-gray-900">Credential Verification</p>
                  <p className="text-[13px] text-gray-600">
                    We'll verify your credentials with the appropriate licensing boards
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-[13px] flex-shrink-0">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[14px] font-medium text-gray-900">Email Notification</p>
                  <p className="text-[13px] text-gray-600">
                    You'll receive an email notification once your application is approved
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-semibold text-[13px] flex-shrink-0">
                  4
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[14px] font-medium text-gray-900">Start Networking</p>
                  <p className="text-[13px] text-gray-600">
                    After approval, you can start sending and receiving referrals
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-[18px] font-semibold text-gray-900">While You Wait...</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[13px] text-blue-900">
              Get ready to unlock exclusive benefits once approved:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-[13px] text-gray-900">Access verified member directory</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-[13px] text-gray-900">Send & receive B2B referrals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-[13px] text-gray-900">Earn performance badges</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-[13px] text-gray-900">Join exclusive network events</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link href="/auth/login" className="block">
            <Button variant="default" className="w-full h-11 text-[14px]">
              Return to Login
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Card className="bg-white text-center">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-[13px] text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Questions? Contact us at</span>
                <a href="mailto:support@proclusive.com" className="text-blue-600 hover:underline font-medium">
                  support@proclusive.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
