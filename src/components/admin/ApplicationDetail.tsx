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
  ImageIcon,
  ZoomIn,
  ZoomOut,
  Pencil,
  Loader2,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any> | null;
  created_at: string;
  admin_name?: string;
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
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);
  const [auditLogsError, setAuditLogsError] = useState<string | null>(null);
  const [auditLogsExpanded, setAuditLogsExpanded] = useState(false);
  const [showAllAuditLogs, setShowAllAuditLogs] = useState(false);

  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileLoading, setEditProfileLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: application.profile.full_name || "",
    company_name: application.profile.company_name || "",
    phone: application.profile.phone || "",
    email: application.profile.email || "",
    street_address: application.profile.street_address || "",
    city: application.profile.city || "",
    state: application.profile.state || "",
    zip_code: application.profile.zip_code || "",
  });

  useEffect(() => {
    loadDocuments();
    loadPortfolioItems();
    loadUserBadges();
    loadProfilePicture();
    loadAuditLogs();
  }, []);

  // Handle escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxImage) {
        if (e.key === "Escape") {
          closeLightbox();
        } else if (e.key === "+" || e.key === "=") {
          handleZoomIn();
        } else if (e.key === "-") {
          handleZoomOut();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, zoomLevel]);

  // Lightbox functions
  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.min(prev + 0.25, 4);
      // Reset pan when zooming back to 1 or below
      if (newZoom <= 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.25, 0.25);
      // Reset pan when zooming back to 1 or below
      if (newZoom <= 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  const loadAuditLogs = async () => {
    setAuditLogsLoading(true);
    setAuditLogsError(null);

    try {
      const supabase = createClient();

      // Query audit logs for both application and profile entity types
      const { data: logs, error } = await supabase
        .from("admin_audit_log")
        .select("*")
        .or(`and(entity_type.eq.application,entity_id.eq.${application.id}),and(entity_type.eq.profile,entity_id.eq.${application.user_id})`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading audit logs:", error);
        setAuditLogsError("Failed to load audit logs");
        setAuditLogsLoading(false);
        return;
      }

      if (logs && logs.length > 0) {
        // Get unique admin IDs
        const adminIds = [...new Set(logs.map((log) => log.admin_id).filter(Boolean))];

        // Fetch admin names
        const { data: adminProfiles, error: adminError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", adminIds);

        // Map admin names to logs
        const adminNameMap: Record<string, string> = {};
        if (!adminError && adminProfiles) {
          adminProfiles.forEach((profile) => {
            adminNameMap[profile.id] = profile.full_name || "Unknown Admin";
          });
        }

        const logsWithNames = logs.map((log) => ({
          ...log,
          admin_name: log.admin_id ? adminNameMap[log.admin_id] || "Unknown Admin" : "System",
        }));

        setAuditLogs(logsWithNames);
      } else {
        setAuditLogs([]);
      }
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setAuditLogsError("An unexpected error occurred");
    } finally {
      setAuditLogsLoading(false);
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

  const openEditProfileModal = () => {
    // Reset form data to current profile values
    setEditFormData({
      full_name: currentApplication.profile.full_name || "",
      company_name: currentApplication.profile.company_name || "",
      phone: currentApplication.profile.phone || "",
      email: currentApplication.profile.email || "",
      street_address: currentApplication.profile.street_address || "",
      city: currentApplication.profile.city || "",
      state: currentApplication.profile.state || "",
      zip_code: currentApplication.profile.zip_code || "",
    });
    setShowEditProfileModal(true);
  };

  const handleEditProfileSave = async () => {
    setEditProfileLoading(true);
    setSuccessMessage(null);
    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Identify which fields changed
      const changedFields: Record<string, any> = {};
      const newValues: Record<string, any> = {};
      const originalProfile = currentApplication.profile;

      const fieldsToCheck = [
        "full_name",
        "company_name",
        "phone",
        "email",
        "street_address",
        "city",
        "state",
        "zip_code",
      ] as const;

      for (const field of fieldsToCheck) {
        const originalValue = originalProfile[field] || "";
        const newValue = editFormData[field] || "";
        if (originalValue !== newValue) {
          changedFields[field] = originalValue;
          newValues[field] = newValue;
        }
      }

      // If no changes, just close the modal
      if (Object.keys(changedFields).length === 0) {
        setShowEditProfileModal(false);
        setEditProfileLoading(false);
        return;
      }

      // Check if email changed - will need special handling
      const emailChanged = "email" in changedFields;

      // Update the profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: editFormData.full_name,
          company_name: editFormData.company_name,
          phone: editFormData.phone || null,
          email: editFormData.email,
          street_address: editFormData.street_address || null,
          city: editFormData.city || null,
          state: editFormData.state || null,
          zip_code: editFormData.zip_code || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", application.user_id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        setSuccessMessage(null);
        setEditProfileLoading(false);
        return;
      }

      // Log admin action to audit log
      await supabase.from("admin_audit_log").insert({
        admin_id: user?.id,
        action: "edited_member_profile",
        entity_type: "profile",
        entity_id: application.user_id,
        details: {
          changed_fields: changedFields,
          new_values: newValues,
        },
      });

      // If email changed, send notifications via API
      if (emailChanged) {
        try {
          const response = await fetch('/api/admin/update-member-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profileId: application.user_id,
              oldEmail: changedFields.email,
              newEmail: newValues.email,
              memberName: editFormData.full_name,
            }),
          });

          if (!response.ok) {
            console.warn('Email notification failed, but profile was updated');
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't fail the update if email notification fails
        }
      }

      // Update local state
      setCurrentApplication((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          full_name: editFormData.full_name,
          company_name: editFormData.company_name,
          phone: editFormData.phone || null,
          email: editFormData.email,
          street_address: editFormData.street_address || null,
          city: editFormData.city || null,
          state: editFormData.state || null,
          zip_code: editFormData.zip_code || null,
        },
      }));

      setShowEditProfileModal(false);
      setSuccessMessage("Profile updated successfully.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setEditProfileLoading(false);
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

  const formatAuditAction = (action: string): string => {
    const actionLabels: Record<string, string> = {
      verified_point: "Verified Point",
      approved_application: "Approved Application",
      updated_application_status: "Updated Application Status",
      edited_member_profile: "Edited Profile",
      rejected_application: "Rejected Application",
      assigned_badge: "Assigned Badge",
      updated_payment_status: "Updated Payment Status",
      created_application: "Created Application",
    };
    return actionLabels[action] || action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatAuditDetails = (details: Record<string, any> | null): string => {
    if (!details) return "";

    const parts: string[] = [];

    if (details.point) {
      const pointLabel = details.point.replace(/point_\d+_/, "").replace(/_/g, " ");
      parts.push(`${pointLabel}: ${details.status || "updated"}`);
    }

    if (details.new_status) {
      parts.push(`Status: ${details.new_status.replace(/_/g, " ")}`);
    }

    if (details.badges_assigned && details.badges_assigned.length > 0) {
      parts.push(`Badges: ${details.badges_assigned.join(", ")}`);
    }

    if (details.changed_fields && Object.keys(details.changed_fields).length > 0) {
      const fields = Object.keys(details.changed_fields).map((f) => f.replace(/_/g, " "));
      parts.push(`Changed: ${fields.join(", ")}`);
    }

    return parts.join(" | ");
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const displayedAuditLogs = showAllAuditLogs ? auditLogs : auditLogs.slice(0, 10);

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
            <div className="flex items-center gap-2">
              <Button
                onClick={openEditProfileModal}
                variant="outline"
                size="sm"
                className="gap-2 border-[#c9a962] text-[#c9a962] hover:bg-[#c9a962]/10"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
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
              <div className="text-[14px] font-medium text-white">{currentApplication.profile.full_name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Email</div>
              <div className="text-[14px] font-medium text-white">{currentApplication.profile.email}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Phone</div>
              <div className="text-[14px] font-medium text-white">{currentApplication.profile.phone || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Company</div>
              <div className="text-[14px] font-medium text-white">{currentApplication.profile.company_name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Primary Trade</div>
              <div><Badge variant="outline">{currentApplication.profile.primary_trade}</Badge></div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Business Type</div>
              <div className="text-[14px] font-medium text-white">{currentApplication.profile.business_type || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Location</div>
              <div className="text-[14px] font-medium text-white">
                {currentApplication.profile.city && currentApplication.profile.state
                  ? `${currentApplication.profile.city}, ${currentApplication.profile.state}`
                  : "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Website</div>
              <div className="text-[14px] font-medium text-white">
                {currentApplication.profile.website ? (
                  <a
                    href={currentApplication.profile.website}
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
              <div className="text-[14px] font-medium text-white">{currentApplication.profile.referred_by || "N/A"}</div>
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
                        onClick={() => openLightbox(portfolioUrls[item.id])}
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

      {/* Audit Log / Activity History */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setAuditLogsExpanded(!auditLogsExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-[#c9a962]" />
              <CardTitle className="text-white">Activity Log</CardTitle>
              {auditLogs.length > 0 && (
                <Badge variant="outline" className="ml-2 text-[#6a6d78] border-[#6a6d78]">
                  {auditLogs.length} {auditLogs.length === 1 ? "entry" : "entries"}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              {auditLogsExpanded ? (
                <ChevronUp className="h-4 w-4 text-[#b0b2bc]" />
              ) : (
                <ChevronDown className="h-4 w-4 text-[#b0b2bc]" />
              )}
            </Button>
          </div>
          <CardDescription className="text-[#b0b2bc]">
            Track all admin actions performed on this member
          </CardDescription>
        </CardHeader>

        {auditLogsExpanded && (
          <CardContent>
            {/* Loading State */}
            {auditLogsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#c9a962]" />
                <span className="ml-2 text-[14px] text-[#b0b2bc]">Loading activity log...</span>
              </div>
            )}

            {/* Error State */}
            {auditLogsError && !auditLogsLoading && (
              <div className="rounded-lg p-4" style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)' }}>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-[#f87171] flex-shrink-0" />
                  <p className="text-[14px] text-[#f87171]">{auditLogsError}</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!auditLogsLoading && !auditLogsError && auditLogs.length === 0 && (
              <div className="text-center py-8">
                <History className="h-10 w-10 mx-auto text-[#6a6d78] opacity-50 mb-3" />
                <p className="text-[14px] text-[#6a6d78]">No activity recorded yet</p>
                <p className="text-[12px] text-[#6a6d78] mt-1">Actions performed on this member will appear here</p>
              </div>
            )}

            {/* Audit Log List */}
            {!auditLogsLoading && !auditLogsError && auditLogs.length > 0 && (
              <div className="space-y-2">
                <div
                  className="max-h-[400px] overflow-y-auto space-y-2 pr-2"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#6a6d78 #282c38' }}
                >
                  {displayedAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 rounded-lg transition-colors hover:bg-[#2f3442]"
                      style={{ background: '#282c38', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[14px] font-medium text-[#c9a962]">
                              {formatAuditAction(log.action)}
                            </span>
                            <Badge variant="outline" className="text-[11px] text-[#6a6d78] border-[#6a6d78]">
                              {log.entity_type}
                            </Badge>
                          </div>
                          {log.details && formatAuditDetails(log.details) && (
                            <p className="text-[13px] text-[#b0b2bc] mt-1 truncate">
                              {formatAuditDetails(log.details)}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-[12px] text-[#6a6d78]">
                            <span>by {log.admin_name}</span>
                            <span>|</span>
                            <span>{formatDateTime(log.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show All / Show Less Toggle */}
                {auditLogs.length > 10 && (
                  <div className="pt-3 border-t border-white/[0.08]">
                    <Button
                      onClick={() => setShowAllAuditLogs(!showAllAuditLogs)}
                      variant="ghost"
                      size="sm"
                      className="w-full text-[#b0b2bc] hover:text-white"
                    >
                      {showAllAuditLogs ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show All ({auditLogs.length} entries)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
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

      {/* Portfolio Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          style={{ background: 'rgba(0, 0, 0, 0.95)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeLightbox();
            }
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:bg-white/10 z-20"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Zoom controls */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full z-20"
            style={{ background: 'rgba(37, 40, 51, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
          >
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.25}
              className="p-2 rounded-full transition-all duration-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-5 w-5 text-white" />
            </button>
            <span className="text-white text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 4}
              className="p-2 rounded-full transition-all duration-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div
            className="absolute bottom-6 right-6 px-3 py-1.5 rounded text-xs text-[#6a6d78] z-20"
            style={{ background: 'rgba(37, 40, 51, 0.7)' }}
          >
            ESC to close | +/- to zoom | Scroll to zoom | Drag to pan
          </div>

          {/* Image container with zoom and pan */}
          <div
            className="relative flex items-center justify-center w-full h-full"
            onWheel={handleWheel}
          >
            <img
              src={lightboxImage}
              alt="Portfolio image preview"
              className="select-none"
              style={{
                maxWidth: zoomLevel <= 1 ? '90vw' : 'none',
                maxHeight: zoomLevel <= 1 ? '85vh' : 'none',
                width: zoomLevel > 1 ? `${90 * zoomLevel}vw` : 'auto',
                height: zoomLevel > 1 ? 'auto' : 'auto',
                objectFit: 'contain',
                transform: `translate(${panPosition.x}px, ${panPosition.y}px)`,
                cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              onMouseDown={handleMouseDown}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfileModal} onOpenChange={setShowEditProfileModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: '#252833', border: '1px solid rgba(201, 169, 98, 0.2)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Pencil className="h-5 w-5 text-[#c9a962]" />
              Edit Member Profile
            </DialogTitle>
            <DialogDescription>
              Update the member's profile information. Changes will be logged to the admin audit log.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="edit_company_name">Company Name</Label>
              <Input
                id="edit_company_name"
                value={editFormData.company_name}
                onChange={(e) => setEditFormData({ ...editFormData, company_name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                type="tel"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="edit_email">
                Email
                <span className="text-[#c9a962] text-xs ml-2">(Changing email will send notifications)</span>
              </Label>
              <Input
                id="edit_email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            {/* Address Section */}
            <div className="pt-2 border-t border-white/[0.08]">
              <h4 className="text-[14px] font-medium text-white mb-4">Address Information</h4>

              {/* Street Address */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="edit_street_address">Street Address</Label>
                <Input
                  id="edit_street_address"
                  value={editFormData.street_address}
                  onChange={(e) => setEditFormData({ ...editFormData, street_address: e.target.value })}
                  placeholder="Enter street address"
                />
              </div>

              {/* City, State, Zip in a row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_city">City</Label>
                  <Input
                    id="edit_city"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_state">State</Label>
                  <Input
                    id="edit_state"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_zip_code">Zip Code</Label>
                  <Input
                    id="edit_zip_code"
                    value={editFormData.zip_code}
                    onChange={(e) => setEditFormData({ ...editFormData, zip_code: e.target.value })}
                    placeholder="Zip"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowEditProfileModal(false)}
              disabled={editProfileLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditProfileSave}
              disabled={editProfileLoading}
              className="gap-2"
            >
              {editProfileLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
