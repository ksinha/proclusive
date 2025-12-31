"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import VettingWizard from "@/components/vetting/VettingWizard";
import { useAuth } from "@/contexts/AuthContext";
import { Application, Profile } from "@/types/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, XCircle, Clock, ArrowRight, Eye, ChevronDown, ChevronUp, Building2, Phone, Mail, MapPin, Globe, Users, Briefcase, FileText, Image } from "lucide-react";

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
  const [pendingApplicationStatus, setPendingApplicationStatus] = useState<"pending" | "under_review" | null>(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("[VettingPage] Profile fetch error:", profileError);
        }

        if (profile) {
          setExistingData({ application, profile });
        }

        // Check if pending or under_review - show waiting screen
        // Store status separately so we can display it even if profile fetch fails
        if (application.status === "pending" || application.status === "under_review") {
          setHasPendingApplication(true);
          setPendingApplicationStatus(application.status as "pending" | "under_review");
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

  // Load application details (portfolio and documents) when viewing
  const loadApplicationDetails = async () => {
    if (!user || !existingData?.application) return;

    setLoadingDetails(true);
    try {
      const supabase = createClient();

      // Fetch portfolio items
      const { data: portfolio } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("profile_id", user.id)
        .order("display_order", { ascending: true });

      if (portfolio) {
        // Get signed URLs for portfolio images
        const portfolioWithUrls = await Promise.all(
          portfolio.map(async (item) => {
            const { data: urlData } = await supabase.storage
              .from("portfolio")
              .createSignedUrl(item.image_url, 3600);
            return { ...item, signedUrl: urlData?.signedUrl };
          })
        );
        setPortfolioItems(portfolioWithUrls);
      }

      // Fetch documents
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .eq("application_id", existingData.application.id)
        .order("created_at", { ascending: true });

      if (docs) {
        setDocuments(docs);
      }
    } catch (err) {
      console.error("[VettingPage] Error loading application details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = () => {
    if (!showApplicationDetails) {
      loadApplicationDetails();
    }
    setShowApplicationDetails(!showApplicationDetails);
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
  // Note: We don't require existingData here because the profile fetch might fail
  // but we still want to show the status screen if we know there's a pending application
  if (hasPendingApplication && !showEditMode) {
    const profile = existingData?.profile;

    return (
      <div className="min-h-screen bg-[#1a1d27] py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Status Card */}
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
                Status: {pendingApplicationStatus === "pending" ? "Pending Review" : "Under Review"}
              </Badge>
            </CardContent>
          </Card>

          {/* View Application Details - Only show if we have profile data */}
          {profile && (
            <Card className="bg-[#252833] border-[rgba(255,255,255,0.08)]">
              <CardHeader
                className="cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                onClick={handleViewDetails}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-[#c9a962]" />
                    <CardTitle className="text-lg text-[#f8f8fa]">View My Application</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] text-[#6a6d78]">
                      {showApplicationDetails ? "Hide details" : "Show details"}
                    </span>
                    {showApplicationDetails ? (
                      <ChevronUp className="h-5 w-5 text-[#6a6d78]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#6a6d78]" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {showApplicationDetails && (
                <CardContent className="space-y-6 border-t border-[rgba(255,255,255,0.08)] pt-6">
                  {loadingDetails ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a962] mx-auto"></div>
                      <p className="mt-3 text-[#b0b2bc] text-sm">Loading application details...</p>
                    </div>
                  ) : (
                    <>
                      {/* Business Information */}
                      <div className="space-y-4">
                        <h4 className="text-[14px] font-semibold text-[#c9a962] uppercase tracking-wide flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Business Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)]">
                            <p className="text-[12px] text-[#6a6d78] uppercase tracking-wide mb-1">Full Name</p>
                            <p className="text-[14px] text-[#f8f8fa]">{profile.full_name || "—"}</p>
                          </div>
                          <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)]">
                            <p className="text-[12px] text-[#6a6d78] uppercase tracking-wide mb-1">Company</p>
                            <p className="text-[14px] text-[#f8f8fa]">{profile.company_name || "—"}</p>
                          </div>
                          <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)]">
                            <p className="text-[12px] text-[#6a6d78] uppercase tracking-wide mb-1 flex items-center gap-1">
                              <Briefcase className="h-3 w-3" /> Primary Trade
                            </p>
                            <p className="text-[14px] text-[#f8f8fa]">{profile.primary_trade || "—"}</p>
                          </div>
                          <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)]">
                            <p className="text-[12px] text-[#6a6d78] uppercase tracking-wide mb-1 flex items-center gap-1">
                              <Users className="h-3 w-3" /> Team Size
                            </p>
                            <p className="text-[14px] text-[#f8f8fa]">{profile.team_size || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h4 className="text-[14px] font-semibold text-[#c9a962] uppercase tracking-wide flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)]">
                            <p className="text-[12px] text-[#6a6d78] uppercase tracking-wide mb-1 flex items-center gap-1">
                              <Mail className="h-3 w-3" /> Email
                            </p>
                            <p className="text-[14px] text-[#f8f8fa]">{profile.email || "—"}</p>
                          </div>
                          <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)]">
                            <p className="text-[12px] text-[#6a6d78] uppercase tracking-wide mb-1 flex items-center gap-1">
                              <Phone className="h-3 w-3" /> Phone
                            </p>
                            <p className="text-[14px] text-[#f8f8fa]">{profile.phone || "—"}</p>
                          </div>
                          <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)] md:col-span-2">
                            <p className="text-[12px] text-[#6a6d78] uppercase tracking-wide mb-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> Address
                            </p>
                            <p className="text-[14px] text-[#f8f8fa]">
                              {profile.street_address && `${profile.street_address}, `}
                              {profile.city && `${profile.city}, `}
                              {profile.state} {profile.zip_code}
                              {!profile.street_address && !profile.city && !profile.state && "—"}
                            </p>
                          </div>
                          {profile.website && (
                            <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)] md:col-span-2">
                              <p className="text-[12px] text-[#6a6d78] uppercase tracking-wide mb-1 flex items-center gap-1">
                                <Globe className="h-3 w-3" /> Website
                              </p>
                              <p className="text-[14px] text-[#c9a962]">{profile.website}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {profile.bio && (
                        <div className="space-y-4">
                          <h4 className="text-[14px] font-semibold text-[#c9a962] uppercase tracking-wide">
                            About
                          </h4>
                          <div className="bg-[#21242f] rounded-lg p-4 border border-[rgba(255,255,255,0.08)]">
                            <p className="text-[14px] text-[#b0b2bc] whitespace-pre-wrap">{profile.bio}</p>
                          </div>
                        </div>
                      )}

                      {/* Documents Submitted */}
                      {documents.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-[14px] font-semibold text-[#c9a962] uppercase tracking-wide flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documents Submitted ({documents.length})
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="bg-[#21242f] rounded-lg p-3 border border-[rgba(255,255,255,0.08)] flex items-center gap-3"
                              >
                                <FileText className="h-4 w-4 text-[#6a6d78]" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] text-[#f8f8fa] truncate">{doc.file_name}</p>
                                  <p className="text-[11px] text-[#6a6d78]">
                                    {doc.document_type?.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-[10px]">
                                  Submitted
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Portfolio */}
                      {portfolioItems.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="text-[14px] font-semibold text-[#c9a962] uppercase tracking-wide flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Portfolio ({portfolioItems.length} images)
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {portfolioItems.map((item) => (
                              <div
                                key={item.id}
                                className="aspect-square rounded-lg overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#21242f]"
                              >
                                {item.signedUrl ? (
                                  <img
                                    src={item.signedUrl}
                                    alt={item.description || "Portfolio image"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[#6a6d78]">
                                    <Image className="h-8 w-8" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Note about read-only */}
                      <div className="bg-[rgba(201,169,98,0.1)] border border-[rgba(201,169,98,0.3)] rounded-lg p-4 text-center">
                        <p className="text-[13px] text-[#c9a962]">
                          This is a read-only view of your submitted application.
                          You'll be able to edit your profile after approval.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          )}
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
