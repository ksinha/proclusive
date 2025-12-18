"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Application, Profile, Document, BadgeLevel } from "@/types/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VaasBadgeCard } from "@/components/ui/vaas-badge";
import { Avatar } from "@/components/ui/avatar";
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  MessageSquare,
  Eye,
  X,
  ArrowLeft,
  ImageIcon
} from "lucide-react";

interface ApplicationWithProfile extends Application {
  profile: Profile;
}

interface ApplicationDetailProps {
  application: ApplicationWithProfile;
  onClose: () => void;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  description: string | null;
  display_order: number;
}

const BADGE_OPTIONS: BadgeLevel[] = ["verified", "vetted", "elite"];

export default function ApplicationDetail({ application, onClose }: ApplicationDetailProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioUrls, setPortfolioUrls] = useState<Record<string, string>>({});
  const [selectedBadges, setSelectedBadges] = useState<BadgeLevel[]>([]);
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || "");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentApplication, setCurrentApplication] = useState<ApplicationWithProfile>(application);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(application.profile.is_paid || false);
  const [paidAt, setPaidAt] = useState(application.profile.paid_at || "");

  useEffect(() => {
    loadDocuments();
    loadPortfolioItems();
    loadUserBadges();
    loadProfilePicture();
  }, []);

  const loadProfilePicture = async () => {
    if (!application.profile.profile_picture_url) return;

    const supabase = createClient();
    const { data: signedUrl } = await supabase.storage
      .from("profile-pictures")
      .createSignedUrl(application.profile.profile_picture_url, 3600);

    if (signedUrl) {
      setProfilePictureUrl(signedUrl.signedUrl);
    }
  };

  const loadUserBadges = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_badges")
      .select("badge_level")
      .eq("user_id", application.user_id);

    if (!error && data && data.length > 0) {
      // Load badges from user_badges table
      const badges = data.map(b => b.badge_level as BadgeLevel);
      setSelectedBadges(badges);
    } else if (application.profile.badge_level !== "none") {
      // Fallback to profile.badge_level if no user_badges found
      setSelectedBadges([application.profile.badge_level]);
    }
  };

  const loadDocuments = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("application_id", application.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  };

  const loadPortfolioItems = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("profile_id", application.user_id)
      .order("display_order", { ascending: true });

    if (!error && data) {
      setPortfolioItems(data);

      // Load signed URLs for each portfolio image
      const urls: Record<string, string> = {};
      for (const item of data) {
        const { data: signedData } = await supabase.storage
          .from("portfolio")
          .createSignedUrl(item.image_url, 3600);

        if (signedData) {
          urls[item.id] = signedData.signedUrl;
        }
      }
      setPortfolioUrls(urls);
    }
  };

  const handleVerifyPoint = async (pointField: string, status: "verified" | "rejected") => {
    setLoading(true);
    setSuccessMessage(null);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("applications")
      .update({
        [pointField]: status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", application.id);

    if (!error) {
      // Log admin action
      await supabase.from("admin_audit_log").insert({
        admin_id: user?.id,
        action: "verified_point",
        entity_type: "application",
        entity_id: application.id,
        details: { point: pointField, status },
      });

      // Update local state instead of closing
      setCurrentApplication((prev) => ({
        ...prev,
        [pointField]: status,
      }));

      setSuccessMessage(`Successfully ${status} the verification point.`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    }

    setLoading(false);
  };

  const handleUpdateStatus = async (newStatus: "pending" | "under_review" | "approved" | "rejected") => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const updateData: any = {
      status: newStatus,
      admin_notes: adminNotes,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };

    // If approving, also update profile with highest badge
    if (newStatus === "approved") {
      // Determine highest badge for backward compatibility
      const badgePriority: Record<BadgeLevel, number> = {
        elite: 3,
        vetted: 2,
        verified: 1,
        none: 0,
        compliance: 1,
        capability: 2,
        reputation: 2,
        enterprise: 3,
      };

      const highestBadge = selectedBadges.length > 0
        ? selectedBadges.reduce((highest, badge) =>
            badgePriority[badge] > badgePriority[highest] ? badge : highest
          )
        : "none" as BadgeLevel;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_verified: true,
          badge_level: highestBadge,
          verification_completed_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
        })
        .eq("id", application.user_id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        setLoading(false);
        return;
      }

      // Also insert into user_badges table for multiple badges support
      if (selectedBadges.length > 0) {
        for (const badge of selectedBadges) {
          await supabase.from("user_badges").upsert({
            user_id: application.user_id,
            badge_level: badge,
            awarded_by: user?.id,
            notes: `Awarded during application approval`,
          }, { onConflict: "user_id,badge_level" });
        }
      }
    }

    const { error } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", application.id);

    if (!error) {
      // Log admin action
      await supabase.from("admin_audit_log").insert({
        admin_id: user?.id,
        action: newStatus === "approved" ? "approved_application" : "updated_application_status",
        entity_type: "application",
        entity_id: application.id,
        details: { new_status: newStatus, badges_assigned: selectedBadges },
      });

      // Send approval email if status is approved
      if (newStatus === "approved") {
        try {
          const response = await fetch('/api/applications/approve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              applicationId: application.id,
              badgeLevel: selectedBadges.length > 0 ? selectedBadges.reduce((highest, badge) => {
                const badgePriority: Record<string, number> = {
                  elite: 3, vetted: 2, verified: 1, none: 0,
                  compliance: 1, capability: 2, reputation: 2, enterprise: 3,
                };
                return (badgePriority[badge] || 0) > (badgePriority[highest] || 0) ? badge : highest;
              }) : 'verified',
            }),
          });

          if (response.ok) {
            console.log('Approval notification email sent');
          } else {
            console.error('Failed to send approval notification email');
          }
        } catch (emailError) {
          console.error('Error sending approval email:', emailError);
          // Don't fail the approval if email fails
        }
      }

      onClose();
    }

    setLoading(false);
  };

  const handleRejectWithEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/applications/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: application.id,
          adminNotes: rejectionNotes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage(result.message);
        setShowRejectModal(false);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.error('Rejection failed:', result.error);
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('Error rejecting application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    setLoading(true);
    setSuccessMessage(null);
    const supabase = createClient();

    const updateData: any = {
      is_paid: isPaid,
      paid_at: isPaid && paidAt ? new Date(paidAt).toISOString() : null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", application.user_id);

    if (!error) {
      setSuccessMessage(`Payment status updated successfully.`);

      // Update local state
      setCurrentApplication((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          is_paid: isPaid,
          paid_at: updateData.paid_at,
        },
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      console.error("Error updating payment status:", error);
    }

    setLoading(false);
  };

  const handlePreviewDocument = async (doc: Document) => {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.file_path, 3600);

    if (data) {
      setPreviewUrl(data.signedUrl);
    }
  };

  const getPointStatus = (status: string) => {
    const variants = {
      not_submitted: "secondary",
      pending: "warning",
      verified: "success",
      rejected: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "secondary"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const tier1Points = [
    { key: "point_1_business_reg", label: "Business Registration", value: currentApplication.point_1_business_reg },
    { key: "point_2_prof_license", label: "Professional License", value: currentApplication.point_2_prof_license },
    { key: "point_3_liability_ins", label: "Liability Insurance", value: currentApplication.point_3_liability_ins },
    { key: "point_4_workers_comp", label: "Workers' Compensation", value: currentApplication.point_4_workers_comp },
    { key: "point_5_contact_verify", label: "Contact Verification", value: currentApplication.point_5_contact_verify },
    { key: "point_6_portfolio", label: "Tax Compliance (W-9)", value: currentApplication.point_6_portfolio },
  ];

  // Document type order matching verification points
  const documentTypeOrder: Record<string, number> = {
    business_registration: 1,
    professional_license: 2,
    liability_insurance: 3,
    workers_comp: 4,
    contact_verification: 5,
    tax_compliance: 6,
  };

  // Sort documents by verification point order
  const sortedDocuments = [...documents].sort((a, b) => {
    const orderA = documentTypeOrder[a.document_type] || 99;
    const orderB = documentTypeOrder[b.document_type] || 99;
    return orderA - orderB;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Back to Dashboard Button */}
      <div>
        <Button
          onClick={onClose}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="rounded-lg p-4" style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#4ade80] flex-shrink-0" />
            <p className="text-[14px] font-medium text-[#4ade80]">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                src={profilePictureUrl}
                alt={application.profile.full_name}
                fallbackInitials={application.profile.full_name}
                size="xl"
              />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <CardTitle className="text-[24px] font-semibold text-white">
                    {application.profile.full_name}
                  </CardTitle>
                  {currentApplication.status === "approved" && (currentApplication.profile as any).member_number && (
                    <Badge variant="outline" className="text-[#c9a962] border-[#c9a962]">
                      Member #{(currentApplication.profile as any).member_number}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-[14px] text-[#b0b2bc]">
                  {application.profile.company_name} • Submitted on {new Date(application.created_at).toLocaleString()}
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Information */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#c9a962]" />
              <CardTitle className="text-white">Profile Information</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {currentApplication.point_8_certifications === "pending" || currentApplication.point_8_certifications === "not_submitted" ? (
                <>
                  <Button
                    onClick={() => handleVerifyPoint("point_8_certifications", "verified")}
                    disabled={loading}
                    size="sm"
                    variant="default"
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Verify Profile
                  </Button>
                  <Button
                    onClick={() => handleVerifyPoint("point_8_certifications", "rejected")}
                    disabled={loading}
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Reject Profile
                  </Button>
                </>
              ) : (
                <Badge variant={currentApplication.point_8_certifications === "verified" ? "success" : "destructive"} size="lg">
                  {currentApplication.point_8_certifications === "verified" ? "Profile Verified" : "Profile Rejected"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Full Name</div>
              <div className="text-[14px] font-medium text-white">{application.profile.full_name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Email</div>
              <div className="text-[14px] font-medium text-white">{application.profile.email}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Phone</div>
              <div className="text-[14px] font-medium text-white">{application.profile.phone || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Company</div>
              <div className="text-[14px] font-medium text-white">{application.profile.company_name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Primary Trade</div>
              <div><Badge variant="outline">{application.profile.primary_trade}</Badge></div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Business Type</div>
              <div className="text-[14px] font-medium text-white">{application.profile.business_type || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Location</div>
              <div className="text-[14px] font-medium text-white">
                {application.profile.city && application.profile.state
                  ? `${application.profile.city}, ${application.profile.state}`
                  : "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Website</div>
              <div className="text-[14px] font-medium text-white">
                {application.profile.website ? (
                  <a
                    href={application.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#60a5fa] hover:text-[#7ab8ff]"
                  >
                    Visit Website
                  </a>
                ) : (
                  "N/A"
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Referred By</div>
              <div className="text-[14px] font-medium text-white">{application.profile.referred_by || "N/A"}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier 1 Verification Points */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-white">Tier 1 Verification Points</CardTitle>
          </div>
          <CardDescription className="text-[#b0b2bc]">Review and verify submitted documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tier1Points.map((point) => (
              <div key={point.key} className="flex items-center justify-between p-4 rounded-lg" style={{ background: '#282c38', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-white">
                    {point.label}
                    {point.key === "point_4_workers_comp" && currentApplication.workers_comp_exempt_sole_prop && (
                      <Badge variant="outline" className="ml-2 text-[11px] text-[#c9a962] border-[#c9a962]">
                        Exempt - Sole Proprietor
                      </Badge>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getPointStatus(point.value)}
                  {point.value === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVerifyPoint(point.key, "verified")}
                        disabled={loading}
                        size="sm"
                        variant="default"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Verify
                      </Button>
                      <Button
                        onClick={() => handleVerifyPoint(point.key, "rejected")}
                        disabled={loading}
                        size="sm"
                        variant="destructive"
                      >
                        <XCircle className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-white">Uploaded Documents ({documents.length})</CardTitle>
          </div>
          <CardDescription className="text-[#b0b2bc]">Review submitted documentation files</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedDocuments.length > 0 ? (
            <div className="space-y-2">
              {sortedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ background: '#282c38', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-[13px] font-medium text-white">
                      {doc.document_type.replace(/_/g, " ").toUpperCase()}
                    </p>
                    <p className="text-[12px] text-[#6a6d78]">{doc.file_name}</p>
                  </div>
                  <Button
                    onClick={() => handlePreviewDocument(doc)}
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#6a6d78] text-center py-4">No documents uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Items */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#c9a962]" />
                <CardTitle className="text-white">Portfolio ({portfolioItems.length})</CardTitle>
              </div>
              <CardDescription className="text-[#b0b2bc] mt-1">Review submitted portfolio images</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {currentApplication.point_7_references === "pending" || currentApplication.point_7_references === "not_submitted" ? (
                <>
                  <Button
                    onClick={() => handleVerifyPoint("point_7_references", "verified")}
                    disabled={loading}
                    size="sm"
                    variant="default"
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Verify Portfolio
                  </Button>
                  <Button
                    onClick={() => handleVerifyPoint("point_7_references", "rejected")}
                    disabled={loading}
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Reject
                  </Button>
                </>
              ) : (
                <Badge variant={currentApplication.point_7_references === "verified" ? "success" : "destructive"} size="lg">
                  {currentApplication.point_7_references === "verified" ? "Portfolio Verified" : "Portfolio Rejected"}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {portfolioItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className="space-y-2"
                >
                  <div
                    className="aspect-video rounded-lg overflow-hidden flex items-center justify-center"
                    style={{ background: '#1a1d27', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                  >
                    {portfolioUrls[item.id] ? (
                      <img
                        src={portfolioUrls[item.id]}
                        alt={`Portfolio ${item.display_order + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setPreviewUrl(portfolioUrls[item.id])}
                      />
                    ) : (
                      <div className="text-[#6a6d78] text-center p-4">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-[12px]">Loading...</p>
                      </div>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[12px] text-[#b0b2bc] line-clamp-2">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-[#6a6d78] text-center py-4">No portfolio items uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Badge Assignment */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-white">Badge Assignment</CardTitle>
          </div>
          <CardDescription className="text-[#b0b2bc]">Select one or more badges to assign to this applicant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            {BADGE_OPTIONS.map((badge) => {
              const isSelected = selectedBadges.includes(badge);
              return (
                <div
                  key={badge}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedBadges(selectedBadges.filter(b => b !== badge));
                    } else {
                      setSelectedBadges([...selectedBadges, badge]);
                    }
                  }}
                  className="cursor-pointer transition-transform hover:scale-105"
                >
                  <VaasBadgeCard level={badge} highlighted={isSelected} />
                </div>
              );
            })}
          </div>
          {selectedBadges.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/[0.08]">
              <p className="text-[12px] text-[#6a6d78] text-center">
                Selected: {selectedBadges.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(", ")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-white">Admin Notes</CardTitle>
          </div>
          <CardDescription className="text-[#b0b2bc]">Add internal notes about this application</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            className="w-full rounded-md shadow-xs text-[14px] border px-3 py-2 text-white"
            style={{ background: '#282c38', border: '1px solid rgba(255, 255, 255, 0.08)' }}
            placeholder="Add notes about this application..."
          />
        </CardContent>
      </Card>

      {/* Payment Status - Only show for approved members */}
      {currentApplication.status === "approved" && (
        <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#c9a962]" />
              <CardTitle className="text-white">Payment Status</CardTitle>
            </div>
            <CardDescription className="text-[#b0b2bc]">Manage payment status for this member</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Date Approved - Read Only */}
              <div>
                <label className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide mb-2 block">
                  Date Approved
                </label>
                <div className="text-[14px] font-medium text-white">
                  {currentApplication.profile.approved_at
                    ? new Date(currentApplication.profile.approved_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : "Not set"}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
                {/* PAID Status Toggle */}
                <div className="mb-4">
                  <label className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide mb-2 block">
                    Payment Status
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPaid(false)}
                      className={`px-4 py-2 rounded-md text-[14px] font-medium transition-colors ${
                        !isPaid
                          ? 'bg-[#f87171] text-white'
                          : 'bg-[#282c38] text-[#b0b2bc] hover:bg-[#2f3442]'
                      }`}
                      style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      NOT PAID
                    </button>
                    <button
                      onClick={() => setIsPaid(true)}
                      className={`px-4 py-2 rounded-md text-[14px] font-medium transition-colors ${
                        isPaid
                          ? 'bg-[#4ade80] text-white'
                          : 'bg-[#282c38] text-[#b0b2bc] hover:bg-[#2f3442]'
                      }`}
                      style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      PAID
                    </button>
                  </div>
                </div>

                {/* Date Paid Input - Only show when PAID is selected */}
                {isPaid && (
                  <div className="mb-4">
                    <label htmlFor="paid_at" className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide mb-2 block">
                      Date Paid
                    </label>
                    <input
                      id="paid_at"
                      type="date"
                      value={paidAt ? new Date(paidAt).toISOString().split('T')[0] : ''}
                      onChange={(e) => setPaidAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
                      className="w-full rounded-md shadow-xs text-[14px] border px-3 py-2 text-white"
                      style={{ background: '#282c38', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    />
                  </div>
                )}

                {/* Save Button */}
                <Button
                  onClick={handleUpdatePaymentStatus}
                  disabled={loading || (isPaid && !paidAt)}
                  variant="default"
                  className="w-full"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Update Payment Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setShowRejectModal(true)}
              disabled={loading}
              variant="destructive"
            >
              <XCircle className="h-4 w-4" />
              Reject Application
            </Button>
            <Button
              onClick={() => handleUpdateStatus("under_review")}
              disabled={loading}
              variant="outline"
            >
              <AlertCircle className="h-4 w-4" />
              Mark Under Review
            </Button>
            <Button
              onClick={() => handleUpdateStatus("approved")}
              disabled={loading}
              variant="default"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve & Assign Badge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0, 0, 0, 0.8)' }}>
          <Card className="max-w-lg w-full" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
            <CardHeader style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-[20px] text-[#f87171]">Reject Application</CardTitle>
                  <CardDescription className="mt-1 text-[#b0b2bc]">
                    Send rejection email with instructions for the applicant
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowRejectModal(false)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Summary of verification points */}
              <div>
                <h4 className="text-[13px] font-medium text-white mb-2">Verification Status Summary</h4>
                <div className="rounded-lg p-3 space-y-1 max-h-48 overflow-y-auto" style={{ background: '#282c38', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  {tier1Points.map((point) => (
                    <div key={point.key} className="flex items-center justify-between text-[13px]">
                      <span className="text-[#b0b2bc]">{point.label}</span>
                      {getPointStatus(point.value)}
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-[#6a6d78] mt-2">
                  This summary will be included in the rejection email.
                </p>
              </div>

              {/* Rejection notes */}
              <div>
                <h4 className="text-[13px] font-medium text-white mb-2">
                  What needs to be fixed? <span className="text-[#f87171]">*</span>
                </h4>
                <textarea
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  rows={4}
                  className="w-full rounded-md shadow-xs text-[14px] border px-3 py-2 text-white"
                  style={{ background: '#282c38', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                  placeholder="Explain what documents or information need to be corrected or resubmitted..."
                />
                <p className="text-[12px] text-[#6a6d78] mt-1">
                  This message will be sent to the applicant via email.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Button
                  onClick={() => setShowRejectModal(false)}
                  variant="outline"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectWithEmail}
                  variant="destructive"
                  disabled={loading || !rejectionNotes.trim()}
                >
                  {loading ? "Sending..." : "Reject & Send Email"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0, 0, 0, 0.9)' }}>
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
            <CardHeader style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-[#c9a962]" />
                  <CardTitle className="text-white">Document Preview</CardTitle>
                </div>
                <Button
                  onClick={() => setPreviewUrl(null)}
                  variant="ghost"
                  size="icon"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <iframe src={previewUrl} className="w-full h-[70vh] rounded-lg" />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
