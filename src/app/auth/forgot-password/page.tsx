"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[ForgotPasswordPage] Starting password reset request...");
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        console.error("[ForgotPasswordPage] Reset error:", resetError);
        setError(resetError.message);
        setLoading(false);
        return;
      }

      console.log("[ForgotPasswordPage] Password reset email sent to:", email);
      setEmailSent(true);
    } catch (err: any) {
      console.error("[ForgotPasswordPage] Unexpected error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Email sent confirmation screen
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-4" style={{ background: '#1a1d27' }}>
        <div className="w-full space-y-6" style={{ maxWidth: '420px' }}>
          <Card className="rounded-xl p-10 sm:p-12" style={{
            background: '#252833',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <CardHeader className="space-y-4 text-center pb-6 px-0">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(201, 169, 98, 0.15)' }}>
                <Mail className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: '#c9a962' }} />
              </div>
              <div>
                <CardTitle
                  className="text-xl sm:text-2xl"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 300,
                    color: '#f8f8fa',
                    letterSpacing: '0.1em'
                  }}
                >
                  Check your email
                </CardTitle>
                <CardDescription className="text-sm mt-3" style={{ color: '#b0b2bc' }}>
                  We've sent a password reset link to
                </CardDescription>
                <p className="text-sm sm:text-base font-medium mt-1 break-words" style={{ color: '#f8f8fa' }}>
                  {email}
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-0 space-y-5 sm:space-y-6">
              {/* Instructions */}
              <div className="rounded-lg p-3 sm:p-4" style={{
                background: 'rgba(201, 169, 98, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h3 className="text-sm sm:text-[14px] font-semibold mb-3 flex items-center gap-2" style={{ color: '#c9a962' }}>
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  Next Steps
                </h3>
                <ol className="text-xs sm:text-[13px] space-y-2 list-decimal list-inside" style={{ color: '#b0b2bc' }}>
                  <li>Open the email from Proclusive</li>
                  <li>Click the password reset link</li>
                  <li>Enter your new password</li>
                </ol>
              </div>

              {/* Tips */}
              <div className="rounded-lg p-3 sm:p-4" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h3 className="text-xs sm:text-[13px] font-medium mb-2" style={{ color: '#f8f8fa' }}>
                  Didn't receive the email?
                </h3>
                <ul className="text-xs sm:text-[13px] space-y-1" style={{ color: '#b0b2bc' }}>
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure <span className="break-all">{email}</span> is correct</li>
                  <li>• Wait a few minutes and check again</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Button
                  variant="outline"
                  className="w-full h-10 sm:h-auto"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f8f8fa'
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try a different email
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm transition-colors underline-offset-4 hover:underline font-medium"
                    style={{ color: '#c9a962', textDecoration: 'none' }}
                  >
                    Back to sign in
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-4" style={{ background: '#1a1d27' }}>
      <div className="w-full space-y-6" style={{ maxWidth: '420px' }}>
        <Card className="rounded-xl p-10 sm:p-12" style={{
          background: '#252833',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <CardHeader className="space-y-4 text-center pb-6 px-0">
            <div>
              <div
                className="text-2xl mb-6"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 300,
                  color: '#f8f8fa',
                  letterSpacing: '0.1em'
                }}
              >
                Proclusive
              </div>
              <CardTitle
                className="text-lg sm:text-xl"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontWeight: 300,
                  color: '#f8f8fa',
                  letterSpacing: '0.1em'
                }}
              >
                Reset your password
              </CardTitle>
              <CardDescription className="text-sm mt-2" style={{ color: '#b0b2bc' }}>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <form onSubmit={handleResetRequest} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: '#b0b2bc', fontSize: '0.9rem' }}>
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Error Display */}
              {error && (
                <Card style={{
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(248, 113, 113, 0.15)'
                }}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium" style={{ color: '#f87171' }}>
                          Reset failed
                        </p>
                        <p className="text-[13px] mt-1" style={{ color: '#f87171' }}>
                          {error}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                variant="default"
                className="w-full h-10 sm:h-11"
                style={{
                  background: '#c9a962',
                  color: '#1a1d27',
                  fontWeight: 500
                }}
              >
                {loading ? "Sending reset link..." : "Send reset link"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-sm transition-colors underline-offset-4 hover:underline font-medium inline-flex items-center gap-2"
            style={{ color: '#c9a962', textDecoration: 'none' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
