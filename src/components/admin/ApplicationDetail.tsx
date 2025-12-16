"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Application, Profile, Document, BadgeLevel } from "@/types/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowLeft
} from "lucide-react";

interface ApplicationWithProfile extends Application {
  profile: Profile;
}

interface ApplicationDetailProps {
  application: ApplicationWithProfile;
  onClose: () => void;
}

const BADGE_LEVELS: { value: BadgeLevel; label: string; variant: any }[] = [
  { value: "none", label: "None", variant: "secondary" },
  { value: "verified", label: "Verified (Blue)", variant: "verified" },
  { value: "vetted", label: "Vetted (Green)", variant: "vetted" },
  { value: "elite", label: "Elite (Gold)", variant: "elite" },
];

export default function ApplicationDetail({ application, onClose }: ApplicationDetailProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeLevel>(application.profile.badge_level);
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || "");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentApplication, setCurrentApplication] = useState<ApplicationWithProfile>(application);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

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

    // If approving, also update profile
    if (newStatus === "approved") {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          is_verified: true,
          badge_level: selectedBadge,
          verification_completed_at: new Date().toISOString(),
        })
        .eq("id", application.user_id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        setLoading(false);
        return;
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
        details: { new_status: newStatus, badge_assigned: selectedBadge },
      });

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
  ];

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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(201, 169, 98, 0.15)' }}>
                <span className="text-[16px] font-semibold text-[#c9a962]">
                  {getInitials(application.profile.full_name)}
                </span>
              </div>
              <div>
                <CardTitle className="text-[24px] font-semibold text-white">
                  {application.profile.full_name}
                </CardTitle>
                <CardDescription className="text-[14px] text-[#b0b2bc]">
                  Submitted on {new Date(application.created_at).toLocaleString()}
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
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-white">Profile Information</CardTitle>
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
                  <p className="text-[13px] font-medium text-white">{point.label}</p>
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
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
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

      {/* Badge Assignment */}
      <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#c9a962]" />
            <CardTitle className="text-white">Badge Assignment</CardTitle>
          </div>
          <CardDescription className="text-[#b0b2bc]">Assign a badge level to this applicant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {BADGE_LEVELS.map((badge) => (
              <label key={badge.value} className="flex items-center p-3 rounded-lg cursor-pointer transition-colors" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', background: selectedBadge === badge.value ? '#282c38' : 'transparent' }}>
                <input
                  type="radio"
                  name="badge"
                  value={badge.value}
                  checked={selectedBadge === badge.value}
                  onChange={(e) => setSelectedBadge(e.target.value as BadgeLevel)}
                  className="mr-3"
                />
                <Badge variant={badge.variant} size="lg">
                  {badge.label}
                </Badge>
              </label>
            ))}
          </div>
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
