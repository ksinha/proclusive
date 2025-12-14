"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import VettingWizard from "@/components/vetting/VettingWizard";

export default function VettingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log("[VettingPage] Checking authentication...");
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("[VettingPage] Auth error:", authError);
        window.location.href = "/auth/signup";
        return;
      }

      if (!user) {
        console.log("[VettingPage] No user found, redirecting to signup");
        window.location.href = "/auth/signup";
        return;
      }

      console.log("[VettingPage] User authenticated:", user.id);

      // Check if user has already submitted application
      const { data: application, error: appError } = await supabase
        .from("applications")
        .select("id, status")
        .eq("user_id", user.id)
        .single();

      if (appError && appError.code !== "PGRST116") {
        console.error("[VettingPage] Application fetch error:", appError);
      }

      if (application) {
        console.log("[VettingPage] Found application:", application.id, "status:", application.status);
        if (application.status === "approved") {
          console.log("[VettingPage] Application approved, redirecting to dashboard");
          window.location.href = "/dashboard";
        } else {
          // Show application status
          setUserId(user.id);
          setLoading(false);
        }
      } else {
        console.log("[VettingPage] No application found, showing wizard");
        setUserId(user.id);
        setLoading(false);
      }
    } catch (err) {
      console.error("[VettingPage] Unexpected error in checkAuth:", err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vetting Application</h1>
          <p className="mt-2 text-lg text-gray-600">
            Complete your verification to join the Proclusive network
          </p>
        </div>

        <VettingWizard userId={userId!} />
      </div>
    </div>
  );
}
