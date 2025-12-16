"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SetupAdminPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleMakeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage({ type: "error", text: "You must be logged in to use this feature." });
        setLoading(false);
        return;
      }

      // Check if a profile exists for the email
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError || !profile) {
        setMessage({ type: "error", text: "No profile found for this email. User must sign up first." });
        setLoading(false);
        return;
      }

      // Update profile to make admin
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("email", email);

      if (updateError) {
        throw updateError;
      }

      setMessage({
        type: "success",
        text: `Successfully granted admin privileges to ${email}. They can now access the admin dashboard.`,
      });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "An error occurred" });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1d27] flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-[#282c38] border-2 border-[rgba(255,255,255,0.08)] rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#c9a962]" />
            </div>
          </div>
          <h1 className="text-[24px] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[#f8f8fa]">
            Admin Bootstrap
          </h1>
          <p className="text-[14px] text-[#b0b2bc]">
            Grant admin privileges to a user account
          </p>
        </div>

        {/* Warning Card */}
        <Card className="bg-[#252833] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <CardContent className="py-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-[#c9a962] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-[13px] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[#f8f8fa] mb-1">Security Notice</h3>
                <p className="text-[13px] text-[#b0b2bc]">
                  This page allows you to grant admin privileges. Only use this for trusted accounts.
                  In production, this should be restricted or removed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="bg-[#252833] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <CardHeader>
            <CardTitle className="font-['Cormorant_Garamond',Georgia,serif] text-[#f8f8fa]">Grant Admin Access</CardTitle>
            <CardDescription className="text-[#b0b2bc]">
              Enter the email of the user you want to make an admin. The user must have already signed up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMakeAdmin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#b0b2bc]">User Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#282c38] border-[rgba(255,255,255,0.08)] text-[#f8f8fa] focus:border-[#c9a962] focus:ring-[#c9a962]"
                />
              </div>

              {message && (
                <Card className={message.type === "success" ? "bg-[#282c38] border-[#c9a962]" : "bg-[#282c38] border-red-400"}>
                  <CardContent className="py-3 px-4">
                    <div className="flex gap-3">
                      {message.type === "success" ? (
                        <CheckCircle className="h-5 w-5 text-[#c9a962] flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      )}
                      <p className="text-[13px] text-[#f8f8fa]">{message.text}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button type="submit" disabled={loading} variant="default" className="w-full h-11 bg-[#c9a962] text-[#1a1d27] hover:bg-[#d4b674]">
                {loading ? "Processing..." : "Grant Admin Privileges"}
              </Button>

              <div className="text-center pt-2">
                <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-medium text-[#c9a962] hover:text-[#d4b674] transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-[#252833] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <CardContent className="py-4">
            <h3 className="text-[13px] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[#f8f8fa] mb-2">Alternative: Direct Database Method</h3>
            <p className="text-[13px] text-[#b0b2bc] mb-3">
              You can also grant admin privileges directly in Supabase:
            </p>
            <ol className="text-[13px] text-[#b0b2bc] list-decimal list-inside space-y-1">
              <li>Go to your Supabase dashboard</li>
              <li>Open the Table Editor</li>
              <li>Navigate to the "profiles" table</li>
              <li>Find the user's row and set "is_admin" to true</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
