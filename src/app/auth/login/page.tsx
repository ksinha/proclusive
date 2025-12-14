"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[LoginPage] Starting login...");
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      console.log("[LoginPage] Calling signInWithPassword...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[LoginPage] Sign in error:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log("[LoginPage] User authenticated:", data.user.id);

        // Check if user is admin
        console.log("[LoginPage] Fetching profile...");
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin, is_verified")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.error("[LoginPage] Profile fetch error:", profileError);
          // No profile yet, send to vetting
          console.log("[LoginPage] Redirecting to vetting (no profile)");
          window.location.href = "/vetting";
          return;
        }

        console.log("[LoginPage] Profile loaded:", {
          is_admin: profile?.is_admin,
          is_verified: profile?.is_verified,
        });

        let redirectUrl = "/vetting";
        if (profile?.is_admin) {
          redirectUrl = "/admin/dashboard";
        } else if (profile?.is_verified) {
          redirectUrl = "/dashboard";
        }

        console.log("[LoginPage] Redirecting to:", redirectUrl);
        window.location.href = redirectUrl;
      } else {
        console.error("[LoginPage] No user returned");
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("[LoginPage] Login error:", err);
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

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
                Sign in to your account
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <form onSubmit={handleLogin} className="space-y-5">
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
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
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
                          Authentication failed
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
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-700 transition-colors underline-offset-4 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
