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
  X
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
  { value: "compliance", label: "Compliance (Blue)", variant: "compliance" },
  { value: "capability", label: "Capability (Green)", variant: "capability" },
  { value: "reputation", label: "Reputation (Purple)", variant: "reputation" },
  { value: "enterprise", label: "Enterprise (Gold)", variant: "enterprise" },
];

export default function ApplicationDetail({ application, onClose }: ApplicationDetailProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<BadgeLevel>(application.profile.badge_level);
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || "");
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentApplication, setCurrentApplication] = useState<ApplicationWithProfile>(application);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-[14px] font-medium text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-[16px] font-semibold text-primary">
                  {getInitials(application.profile.full_name)}
                </span>
              </div>
              <div>
                <CardTitle className="text-[24px] font-semibold text-gray-900">
                  {application.profile.full_name}
                </CardTitle>
                <CardDescription className="text-[14px] text-gray-600">
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profile Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Full Name</div>
              <div className="text-[14px] font-medium text-gray-900">{application.profile.full_name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Email</div>
              <div className="text-[14px] font-medium text-gray-900">{application.profile.email}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Phone</div>
              <div className="text-[14px] font-medium text-gray-900">{application.profile.phone || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Company</div>
              <div className="text-[14px] font-medium text-gray-900">{application.profile.company_name}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Primary Trade</div>
              <div><Badge variant="outline">{application.profile.primary_trade}</Badge></div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Business Type</div>
              <div className="text-[14px] font-medium text-gray-900">{application.profile.business_type || "N/A"}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Location</div>
              <div className="text-[14px] font-medium text-gray-900">
                {application.profile.city && application.profile.state
                  ? `${application.profile.city}, ${application.profile.state}`
                  : "N/A"}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Website</div>
              <div className="text-[14px] font-medium text-gray-900">
                {application.profile.website ? (
                  <a
                    href={application.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Tier 1 Verification Points</CardTitle>
          </div>
          <CardDescription>Review and verify submitted documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tier1Points.map((point) => (
              <div key={point.key} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                <div className="flex-1">
                  <p className="text-[13px] font-medium">{point.label}</p>
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Uploaded Documents ({documents.length})</CardTitle>
          </div>
          <CardDescription>Review submitted documentation files</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-[13px] font-medium">
                      {doc.document_type.replace(/_/g, " ").toUpperCase()}
                    </p>
                    <p className="text-[12px] text-muted-foreground">{doc.file_name}</p>
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
            <p className="text-[14px] text-muted-foreground text-center py-4">No documents uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Badge Assignment */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Badge Assignment</CardTitle>
          </div>
          <CardDescription>Assign a badge level to this applicant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {BADGE_LEVELS.map((badge) => (
              <label key={badge.value} className="flex items-center p-3 hover:bg-muted/30 rounded-lg cursor-pointer border transition-colors">
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
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Admin Notes</CardTitle>
          </div>
          <CardDescription>Add internal notes about this application</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            className="w-full border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-[14px] border px-3 py-2 bg-white"
            placeholder="Add notes about this application..."
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => handleUpdateStatus("rejected")}
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

      {/* Document Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  <CardTitle>Document Preview</CardTitle>
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
