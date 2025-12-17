"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, RefreshCw, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, { title: string; description: string; action: string; showResend: boolean }> = {
  access_denied: {
    title: "Access Denied",
    description: "The confirmation link has expired or has already been used.",
    action: "Enter your email below to receive a new confirmation link.",
    showResend: true,
  },
  exchange_failed: {
    title: "Confirmation Failed",
    description: "We couldn't verify your email confirmation link.",
    action: "The link may have expired. Enter your email to receive a new confirmation link.",
    showResend: true,
  },
  missing_code: {
    title: "Invalid Link",
    description: "The confirmation link appears to be incomplete or invalid.",
    action: "Please click the link directly from your email, or request a new confirmation email below.",
    showResend: true,
  },
  unexpected_error: {
    title: "Something Went Wrong",
    description: "An unexpected error occurred while confirming your account.",
    action: "Please try again or contact support if the problem persists.",
    showResend: true,
  },
  default: {
    title: "Account Not Found",
    description: "We couldn't find an account associated with this confirmation link.",
    action: "The link may have expired or been used already. Enter your email to receive a new confirmation link.",
    showResend: true,
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "default";
  const message = searchParams.get("message");

  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);

  const errorInfo = ERROR_MESSAGES[error] || ERROR_MESSAGES.default;

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResendLoading(true);
    setResendError(null);

    try {
      const supabase = createClient();
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (resendErr) {
        setResendError(resendErr.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err: unknown) {
      setResendError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-4" style={{ background: '#1a1d27' }}>
      <div className="w-full space-y-6" style={{ maxWidth: '420px' }}>
        <Card className="rounded-xl p-10 sm:p-12" style={{
          background: '#252833',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <CardHeader className="space-y-4 text-center pb-6 px-0">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(248, 113, 113, 0.15)' }}>
              <AlertCircle className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: '#f87171' }} />
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
                {errorInfo.title}
              </CardTitle>
              <CardDescription className="text-sm mt-3" style={{ color: '#b0b2bc' }}>
                {errorInfo.description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0 space-y-5 sm:space-y-6">
            {message && (
              <div className="rounded-lg p-3 sm:p-4" style={{
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <p className="text-xs sm:text-[13px]" style={{ color: '#f87171' }}>
                  {message}
                </p>
              </div>
            )}

            <div className="rounded-lg p-3 sm:p-4" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <h3 className="text-xs sm:text-[13px] font-medium mb-2" style={{ color: '#f8f8fa' }}>
                What to do next
              </h3>
              <p className="text-xs sm:text-[13px]" style={{ color: '#b0b2bc' }}>
                {errorInfo.action}
              </p>
            </div>

            {/* Resend Confirmation Email Form */}
            {errorInfo.showResend && !resendSuccess && (
              <form onSubmit={handleResendConfirmation} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: '#b0b2bc', fontSize: '0.85rem' }}>
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {resendError && (
                  <p className="text-xs" style={{ color: '#f87171' }}>
                    {resendError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={resendLoading || !email}
                  className="w-full h-10 sm:h-11"
                  style={{
                    background: '#c9a962',
                    color: '#1a1d27',
                    fontWeight: 500
                  }}
                >
                  {resendLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Resend confirmation email
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Success State */}
            {resendSuccess && (
              <div className="rounded-lg p-4" style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
                      Confirmation email sent!
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#b0b2bc' }}>
                      Check your inbox for a new confirmation link. Don't forget to check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Link href="/auth/login" className="block">
                <Button
                  variant="outline"
                  className="w-full h-10 sm:h-auto"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f8f8fa'
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm" style={{ color: '#b0b2bc' }}>
            Need help?{" "}
            <a
              href="mailto:support@proclusive.com"
              className="transition-colors underline-offset-4 hover:underline font-medium"
              style={{ color: '#c9a962', textDecoration: 'none' }}
            >
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1d27' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#c9a962' }}></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
