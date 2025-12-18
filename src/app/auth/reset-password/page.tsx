"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Check, X } from "lucide-react";
import Link from "next/link";

// Password requirements
const PASSWORD_REQUIREMENTS = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log("[ResetPasswordPage] Valid recovery session found");
          setIsValidSession(true);
        } else {
          console.log("[ResetPasswordPage] No valid session found");
          setError("Invalid or expired reset link. Please request a new password reset.");
        }
      } catch (err) {
        console.error("[ResetPasswordPage] Session check error:", err);
        setError("Failed to verify reset link. Please try again.");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  // Check password strength
  const passwordChecks = useMemo(() => {
    return PASSWORD_REQUIREMENTS.map((req) => ({
      ...req,
      met: req.test(password),
    }));
  }, [password]);

  const isPasswordStrong = passwordChecks.every((check) => check.met);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordStrong) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    console.log("[ResetPasswordPage] Starting password reset...");
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error("[ResetPasswordPage] Password update error:", updateError);
        setError(updateError.message);
        setLoading(false);
        return;
      }

      console.log("[ResetPasswordPage] Password updated successfully");
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      console.error("[ResetPasswordPage] Unexpected error:", err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  // Loading state while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-4" style={{ background: '#1a1d27' }}>
        <div className="w-full space-y-6" style={{ maxWidth: '420px' }}>
          <Card className="rounded-xl p-10 sm:p-12" style={{
            background: '#252833',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <CardContent className="py-8 px-0">
              <div className="text-center" style={{ color: '#b0b2bc' }}>
                Verifying reset link...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-4" style={{ background: '#1a1d27' }}>
        <div className="w-full space-y-6" style={{ maxWidth: '420px' }}>
          <Card className="rounded-xl p-10 sm:p-12" style={{
            background: '#252833',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <CardHeader className="space-y-4 text-center pb-6 px-0">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8" style={{ color: '#22c55e' }} />
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
                  Password reset successful
                </CardTitle>
                <CardDescription className="text-sm mt-3" style={{ color: '#b0b2bc' }}>
                  Your password has been updated. Redirecting to sign in...
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  // Invalid session state
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-4" style={{ background: '#1a1d27' }}>
        <div className="w-full space-y-6" style={{ maxWidth: '420px' }}>
          <Card className="rounded-xl p-10 sm:p-12" style={{
            background: '#252833',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <CardHeader className="space-y-4 text-center pb-6 px-0">
              <div>
                <CardTitle
                  className="text-lg sm:text-xl"
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 300,
                    color: '#f8f8fa',
                    letterSpacing: '0.1em'
                  }}
                >
                  Invalid Reset Link
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-0 space-y-5">
              <Card style={{
                border: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(248, 113, 113, 0.15)'
              }}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium" style={{ color: '#f87171' }}>
                        {error}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Link href="/auth/forgot-password">
                <Button
                  variant="default"
                  className="w-full h-10 sm:h-11"
                  style={{
                    background: '#c9a962',
                    color: '#1a1d27',
                    fontWeight: 500
                  }}
                >
                  Request new reset link
                </Button>
              </Link>

              <div className="text-center">
                <Link
                  href="/auth/login"
                  className="text-sm transition-colors underline-offset-4 hover:underline font-medium"
                  style={{ color: '#c9a962', textDecoration: 'none' }}
                >
                  Back to sign in
                </Link>
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
                Set new password
              </CardTitle>
              <CardDescription className="text-sm mt-2" style={{ color: '#b0b2bc' }}>
                Enter your new password below
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#b0b2bc', fontSize: '0.9rem' }}>
                  New Password
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" style={{ color: '#b0b2bc', fontSize: '0.9rem' }}>
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {/* Password Match Indicator */}
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2 text-xs mt-2">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-3 w-3" style={{ color: '#22c55e' }} />
                        <span style={{ color: '#22c55e' }}>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" style={{ color: '#f87171' }} />
                        <span style={{ color: '#f87171' }}>Passwords do not match</span>
                      </>
                    )}
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
                          Password reset failed
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
                disabled={loading || !isPasswordStrong || !passwordsMatch}
                variant="default"
                className="w-full h-10 sm:h-11"
                style={{
                  background: (loading || !isPasswordStrong || !passwordsMatch) ? 'rgba(201, 169, 98, 0.5)' : '#c9a962',
                  color: '#1a1d27',
                  fontWeight: 500
                }}
              >
                {loading ? "Resetting password..." : "Reset password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
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
    </div>
  );
}
