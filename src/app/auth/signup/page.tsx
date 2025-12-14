"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      // Redirect to vetting wizard
      router.push("/vetting");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-16 px-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="bg-white border border-gray-200 rounded-lg shadow-md p-8">
          <CardHeader className="space-y-4 text-center pb-6 px-0">
            <div>
              <div className="text-[24px] font-bold text-navy-800 mb-6">
                Proclusive
              </div>
              <CardTitle className="text-[20px] font-semibold text-gray-900">
                Create your account
              </CardTitle>
              <CardDescription className="text-[14px] text-gray-600 mt-2">
                High-Trust B2B Referral Network
              </CardDescription>
            </div>
            <div className="flex justify-center pt-2">
              <Badge variant="warning" size="default">
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
                className="w-full h-11"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="text-center">
          <p className="text-[14px] text-gray-600">
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
