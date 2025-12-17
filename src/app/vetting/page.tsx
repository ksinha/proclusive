"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import VettingWizard from "@/components/vetting/VettingWizard";
import { useAuth } from "@/contexts/AuthContext";
import { Application, Profile } from "@/types/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";

interface ExistingApplicationData {
  application: Application;
  profile: Profile;
}

const VERIFICATION_POINT_LABELS: Record<string, string> = {
  point_1_business_reg: "Business Registration",
  point_2_prof_license: "Professional License",
  point_3_liability_ins: "Liability Insurance",
  point_4_workers_comp: "Workers' Compensation",
  point_5_contact_verify: "Contact Verification",
  point_6_portfolio: "Portfolio/Tax Compliance",
};

export default function VettingPage() {
  const { user, isVerified, loading: authLoading } = useAuth();
  const [checkingApplication, setCheckingApplication] = useState(true);
  const [hasApprovedApplication, setHasApprovedApplication] = useState(false);
  const [existingData, setExistingData] = useState<ExistingApplicationData | null>(null);
  const [showEditMode, setShowEditMode] = useState(false);
  const [hasPendingApplication, setHasPendingApplication] = useState(false);

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

      // Get application with all fields
      const { data: application, error: appError } = await supabase
        .from("applications")
        .select("*")
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

        // Get profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          setExistingData({ application, profile });
        }

        // Check if pending or under_review - show waiting screen
        if (application.status === "pending" || application.status === "under_review") {
          setHasPendingApplication(true);
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
      <div className="min-h-screen flex items-center justify-center bg-[#1a1d27]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a962] mx-auto"></div>
          <p className="mt-4 text-[#b0b2bc]">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user after auth loaded, this shouldn't render (redirect happens in useEffect)
  if (!user) {
    return null;
  }

  // Show pending/under review status
  if (hasPendingApplication && existingData && !showEditMode) {
    return (
      <div className="min-h-screen bg-[#1a1d27] py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-[rgba(201,169,98,0.3)] bg-[#252833]">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[rgba(201,169,98,0.15)] rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-[#c9a962]" />
              </div>
              <CardTitle className="text-2xl text-[#f8f8fa]">Application Under Review</CardTitle>
              <CardDescription className="text-[#b0b2bc] text-base mt-2">
                Your application has been submitted and is currently being reviewed by our team.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-[#b0b2bc] mb-4">
                We'll notify you by email once your application has been reviewed.
                This typically takes 1-2 business days.
              </p>
              <Badge variant="warning" size="lg">
                Status: {existingData.application.status === "pending" ? "Pending Review" : "Under Review"}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show rejected application status with option to edit
  if (existingData && existingData.application.status === "rejected" && !showEditMode) {
    const verificationPoints = [
      { key: "point_1_business_reg", status: existingData.application.point_1_business_reg },
      { key: "point_2_prof_license", status: existingData.application.point_2_prof_license },
      { key: "point_3_liability_ins", status: existingData.application.point_3_liability_ins },
      { key: "point_4_workers_comp", status: existingData.application.point_4_workers_comp },
      { key: "point_5_contact_verify", status: existingData.application.point_5_contact_verify },
      { key: "point_6_portfolio", status: existingData.application.point_6_portfolio },
    ];

    return (
      <div className="min-h-screen bg-[#1a1d27] py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header Card */}
          <Card className="border-[rgba(248,113,113,0.3)] bg-[#252833]">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-[rgba(248,113,113,0.15)] rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-[#f87171]" />
              </div>
              <CardTitle className="text-2xl text-[#f8f8fa]">Application Needs Updates</CardTitle>
              <CardDescription className="text-[#b0b2bc] text-base mt-2">
                Your application was reviewed and requires some corrections before it can be approved.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Admin Notes */}
          {existingData.application.admin_notes && (
            <Card className="bg-[#252833] border-[rgba(255,255,255,0.08)]">
              <CardHeader>
                <CardTitle className="text-lg text-[#f8f8fa]">What Needs to be Fixed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[rgba(201,169,98,0.1)] border border-[rgba(201,169,98,0.3)] rounded-lg p-4">
                  <p className="text-[#c9a962] whitespace-pre-wrap">{existingData.application.admin_notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Status */}
          <Card className="bg-[#252833] border-[rgba(255,255,255,0.08)]">
            <CardHeader>
              <CardTitle className="text-lg text-[#f8f8fa]">Verification Status</CardTitle>
              <CardDescription className="text-[#b0b2bc]">Items that need attention are highlighted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {verificationPoints.map((point) => {
                  const label = VERIFICATION_POINT_LABELS[point.key] || point.key;
                  let statusIcon;
                  let statusBadge;

                  switch (point.status) {
                    case "verified":
                      statusIcon = <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />;
                      statusBadge = <Badge variant="success">Approved</Badge>;
                      break;
                    case "rejected":
                      statusIcon = <XCircle className="h-5 w-5 text-[#f87171]" />;
                      statusBadge = <Badge variant="destructive">Needs Revision</Badge>;
                      break;
                    case "pending":
                      statusIcon = <Clock className="h-5 w-5 text-[#c9a962]" />;
                      statusBadge = <Badge variant="warning">Pending</Badge>;
                      break;
                    default:
                      statusIcon = <div className="h-5 w-5 rounded-full border-2 border-[#6a6d78]" />;
                      statusBadge = <Badge variant="secondary">Not Submitted</Badge>;
                  }

                  return (
                    <div
                      key={point.key}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        point.status === "rejected"
                          ? "bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.3)]"
                          : "bg-[#21242f] border-[rgba(255,255,255,0.08)]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {statusIcon}
                        <span className="font-medium text-[#f8f8fa]">{label}</span>
                      </div>
                      {statusBadge}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Button */}
          <Card className="bg-[#252833] border-[rgba(255,255,255,0.08)]">
            <CardContent className="pt-6">
              <Button
                onClick={() => setShowEditMode(true)}
                className="w-full h-12 text-base bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27]"
                size="lg"
              >
                Fix My Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-center text-sm text-[#6a6d78] mt-3">
                You'll be able to update your information and resubmit for review
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show vetting wizard (new application or edit mode)
  return (
    <div className="min-h-screen bg-[#1a1d27] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#f8f8fa]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            {existingData ? "Update Your Application" : "Vetting Application"}
          </h1>
          <p className="mt-2 text-lg text-[#b0b2bc]">
            {existingData
              ? "Make the necessary corrections and resubmit for review"
              : "Complete your verification to join the Proclusive network"}
          </p>
        </div>

        <VettingWizard
          userId={user.id}
          existingApplication={existingData?.application}
          existingProfile={existingData?.profile}
          isEditMode={!!existingData}
        />
      </div>
    </div>
  );
}
