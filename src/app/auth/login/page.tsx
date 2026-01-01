"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

        // Check if user is admin - with timeout to prevent hanging
        console.log("[LoginPage] Fetching profile...");

        try {
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Profile fetch timeout")), 10000);
          });

          const fetchPromise = supabase
            .from("profiles")
            .select("is_admin, is_verified")
            .eq("id", data.user.id)
            .single();

          const { data: profile, error: profileError } = await Promise.race([
            fetchPromise,
            timeoutPromise,
          ]) as Awaited<typeof fetchPromise>;

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
        } catch (timeoutErr) {
          console.error("[LoginPage] Profile fetch timed out:", timeoutErr);
          // On timeout, redirect to vetting as fallback
          window.location.href = "/vetting";
          return;
        }
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
                Sign in to your account
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="px-0 pb-0">
            <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" style={{ color: '#b0b2bc', fontSize: '0.9rem' }}>
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[13px] transition-colors hover:text-[#b0b2bc]"
                    style={{ color: '#6a6d78' }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6d78] hover:text-[#b0b2bc] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                          Authentication failed
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
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="text-center">
          <p className="text-sm" style={{ color: '#b0b2bc' }}>
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="transition-colors underline-offset-4 hover:underline font-medium"
              style={{ color: '#c9a962', textDecoration: 'none' }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
