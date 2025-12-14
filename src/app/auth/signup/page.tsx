"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-16 px-4">
        <div className="max-w-md w-full space-y-6">
          <Card className="bg-white border border-gray-200 rounded-lg shadow-md p-6 sm:p-8">
            <CardHeader className="space-y-4 text-center pb-6 px-0">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Check your email
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-3">
                  We've sent a confirmation link to
                </CardDescription>
                <p className="text-sm sm:text-base font-medium text-gray-900 mt-1 break-words">
                  {email}
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-0 space-y-5 sm:space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <h3 className="text-sm sm:text-[14px] font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  Next Steps
                </h3>
                <ol className="text-xs sm:text-[13px] text-blue-800 space-y-2 list-decimal list-inside">
                  <li>Open the email from Proclusive</li>
                  <li>Click the confirmation link</li>
                  <li>You'll be redirected to complete your vetting application</li>
                </ol>
              </div>

              {/* Tips */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                <h3 className="text-xs sm:text-[13px] font-medium text-gray-700 mb-2">
                  Didn't receive the email?
                </h3>
                <ul className="text-xs sm:text-[13px] text-gray-600 space-y-1">
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
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Try a different email
                </Button>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline font-medium"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-16 px-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-md p-6 sm:p-8">
          <CardHeader className="space-y-4 text-center pb-6 px-0">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-navy-800 mb-4 sm:mb-6">
                Proclusive
              </div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Create your account
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-2">
                High-Trust B2B Referral Network
              </CardDescription>
            </div>
            <div className="flex justify-center pt-2">
              <Badge variant="warning" size="default" className="text-xs sm:text-sm">
                Invitation & Vetting Required
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">
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
                <Label htmlFor="password">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-red-900">
                          Sign up failed
                        </p>
                        <p className="text-[13px] text-red-800 mt-1">
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
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
