"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import VettingWizard from "@/components/vetting/VettingWizard";
import { useAuth } from "@/contexts/AuthContext";

export default function VettingPage() {
  const { user, isVerified, loading: authLoading } = useAuth();
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [hasApprovedApplication, setHasApprovedApplication] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      console.log("[VettingPage] Auth loaded:", { user: user?.id, isVerified });

      if (!user) {
        console.log("[VettingPage] No user, redirecting to signup");
        window.location.href = "/auth/signup";
        return;
      }

      // If already verified, redirect to dashboard
      if (isVerified) {
        console.log("[VettingPage] User is verified, redirecting to dashboard");
        window.location.href = "/dashboard";
        return;
      }

      // Check for existing application
      checkApplication();
    }
  }, [authLoading, user, isVerified]);

  const checkApplication = async () => {
    if (!user) return;

    try {
      console.log("[VettingPage] Checking for existing application...");
      const supabase = createClient();
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
          setHasApprovedApplication(true);
          window.location.href = "/dashboard";
          return;
        }
      } else {
        console.log("[VettingPage] No existing application");
      }

      setCheckingApplication(false);
    } catch (err) {
      console.error("[VettingPage] Error checking application:", err);
      setCheckingApplication(false);
    }
  };

  // Show loading while auth is being checked or application is being checked
  if (authLoading || checkingApplication || hasApprovedApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user after auth loaded, this shouldn't render (redirect happens in useEffect)
  if (!user) {
    return null;
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

        <VettingWizard userId={user.id} />
      </div>
    </div>
  );
}
