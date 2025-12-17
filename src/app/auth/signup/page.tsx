"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Mail, CheckCircle2, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Check password strength
  const passwordChecks = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      ...req,
      met: req.test(password),
    }));
  }, [password]);

  const isPasswordStrong = passwordChecks.every((check) => check.met);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      setError("Please meet all password requirements");
      return;
    }

    console.log("[SignUpPage] Starting signup...");
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error("[SignUpPage] Signup error:", signUpError);
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("[SignUpPage] User created:", data.user.id);
        // Check if email confirmation is required
        // If identities is empty, it means the user needs to confirm their email
        // Or if the user already exists but hasn't confirmed
        if (data.user.identities?.length === 0) {
          // User already exists
          setError("An account with this email already exists. Please sign in instead.");
          setLoading(false);
          return;
        }

        // Show confirmation screen
        console.log("[SignUpPage] Email confirmation sent to:", email);
        setEmailSent(true);
      }
    } catch (err: any) {
      console.error("[SignUpPage] Unexpected error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Email confirmation sent screen
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
                  We've sent a confirmation link to
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
                  <li>Click the confirmation link</li>
                  <li>You'll be redirected to complete your vetting application</li>
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
                    setPassword("");
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
                    Already confirmed? Sign in
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
                Create your account
              </CardTitle>
              <CardDescription className="text-sm mt-2" style={{ color: '#b0b2bc' }}>
                High-Trust B2B Referral Network
              </CardDescription>
            </div>
            <div className="flex justify-center pt-2">
              <Badge
                variant="warning"
                size="default"
                className="text-xs sm:text-sm"
                style={{
                  background: 'rgba(201, 169, 98, 0.15)',
                  color: '#c9a962',
                  border: '1px solid rgba(201, 169, 98, 0.3)'
                }}
              >
                Invitation & Vetting Required
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <form onSubmit={handleSignUp} className="space-y-5">
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

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#b0b2bc', fontSize: '0.9rem' }}>
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordRequirements(true)}
                />

                {/* Password Requirements */}
                {showPasswordRequirements && password.length > 0 && (
                  <div className="rounded-lg p-3 mt-2" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}>
                    <p className="text-xs font-medium mb-2" style={{ color: '#b0b2bc' }}>
                      Password requirements:
                    </p>
                    <ul className="space-y-1">
                      {passwordChecks.map((check) => (
                        <li key={check.key} className="flex items-center gap-2 text-xs">
                          {check.met ? (
                            <Check className="h-3 w-3" style={{ color: '#22c55e' }} />
                          ) : (
                            <X className="h-3 w-3" style={{ color: '#6a6d78' }} />
                          )}
                          <span style={{ color: check.met ? '#22c55e' : '#6a6d78' }}>
                            {check.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                          Sign up failed
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
                disabled={loading || !isPasswordStrong}
                variant="default"
                className="w-full h-10 sm:h-11"
                style={{
                  background: loading || !isPasswordStrong ? 'rgba(201, 169, 98, 0.5)' : '#c9a962',
                  color: '#1a1d27',
                  fontWeight: 500
                }}
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="text-center">
          <p className="text-sm" style={{ color: '#b0b2bc' }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="transition-colors underline-offset-4 hover:underline font-medium"
              style={{ color: '#c9a962', textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
