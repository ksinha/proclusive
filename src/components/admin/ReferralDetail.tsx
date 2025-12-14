"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Referral, Profile, ReferralStatus } from "@/types/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckCircle,
  UserCheck,
  Briefcase,
  CheckCircle2,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  DollarSign,
  MessageSquare,
  X,
  ChevronRight,
} from "lucide-react";

interface ReferralWithProfile extends Referral {
  submitter: Profile;
  matched_member?: Profile | null;
}

interface ReferralDetailProps {
  referral: ReferralWithProfile;
  members: Profile[];
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_FLOW: ReferralStatus[] = ["SUBMITTED", "REVIEWED", "MATCHED", "ENGAGED", "COMPLETED"];

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    variant: "secondary" as const,
    icon: FileText,
    color: "bg-gray-100 text-gray-700",
    nextAction: "Mark as Reviewed",
  },
  REVIEWED: {
    label: "Reviewed",
    variant: "warning" as const,
    icon: CheckCircle,
    color: "bg-yellow-100 text-yellow-700",
    nextAction: "Match to Member",
  },
  MATCHED: {
    label: "Matched",
    variant: "info" as const,
    icon: UserCheck,
    color: "bg-blue-100 text-blue-700",
    nextAction: "Mark as Engaged",
  },
  ENGAGED: {
    label: "Engaged",
    variant: "success" as const,
    icon: Briefcase,
    color: "bg-green-100 text-green-700",
    nextAction: "Mark as Completed",
  },
  COMPLETED: {
    label: "Completed",
    variant: "success" as const,
    icon: CheckCircle2,
    color: "bg-green-200 text-green-800",
    nextAction: null,
  },
};

export default function ReferralDetail({
  referral,
  members,
  onClose,
  onUpdate,
}: ReferralDetailProps) {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState(referral.admin_notes || "");
  const [selectedMember, setSelectedMember] = useState<string>(referral.matched_to || "");
  const [showMemberSelect, setShowMemberSelect] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleStatusTransition = async (newStatus: ReferralStatus, matchedTo?: string) => {
    console.log("[ReferralDetail] Starting status transition to:", newStatus);
    setLoading(true);
    setSuccessMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      console.log("[ReferralDetail] Getting current user...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("[ReferralDetail] Auth error:", authError);
        throw new Error("Authentication failed. Please try logging in again.");
      }

      if (!user) {
        console.error("[ReferralDetail] No user found");
        throw new Error("You must be logged in to perform this action.");
      }

      console.log("[ReferralDetail] User authenticated:", user.id);

      const updateData: any = {
        status: newStatus,
        admin_notes: adminNotes,
      };

      // Set timestamps based on status
      if (newStatus === "REVIEWED") {
        updateData.reviewed_by = user.id;
        updateData.reviewed_at = new Date().toISOString();
      } else if (newStatus === "MATCHED") {
        updateData.matched_to = matchedTo || selectedMember;
        updateData.matched_at = new Date().toISOString();
      } else if (newStatus === "ENGAGED") {
        updateData.engaged_at = new Date().toISOString();
      } else if (newStatus === "COMPLETED") {
        updateData.completed_at = new Date().toISOString();
      }

      console.log("[ReferralDetail] Updating referral with data:", updateData);

      const { error: updateError } = await supabase
        .from("referrals")
        .update(updateData)
        .eq("id", referral.id);

      if (updateError) {
        console.error("[ReferralDetail] Update error:", updateError);
        throw updateError;
      }

      console.log("[ReferralDetail] Referral updated successfully");

      // Log admin action
      try {
        await supabase.from("admin_audit_log").insert({
          admin_id: user.id,
          action: `referral_${newStatus.toLowerCase()}`,
          entity_type: "referral",
          entity_id: referral.id,
          details: { new_status: newStatus, matched_to: matchedTo || selectedMember },
        });
        console.log("[ReferralDetail] Audit log created");
      } catch (auditError) {
        console.error("[ReferralDetail] Failed to create audit log:", auditError);
        // Don't fail the operation if audit log fails
      }

      // Send email notification if status is MATCHED
      if (newStatus === "MATCHED") {
        try {
          console.log("[ReferralDetail] Sending member notification...");
          await fetch('/api/referrals/notify-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referralId: referral.id,
              memberId: matchedTo || selectedMember,
            }),
          });
          console.log("[ReferralDetail] Member notification sent");
        } catch (emailError) {
          // Log but don't fail the status update if email fails
          console.error('[ReferralDetail] Failed to send member notification:', emailError);
        }
      }

      setSuccessMessage(`Referral status updated to ${STATUS_CONFIG[newStatus].label}`);
      setTimeout(() => {
        setSuccessMessage(null);
        onUpdate();
      }, 2000);
    } catch (err: any) {
      console.error("[ReferralDetail] Error updating referral:", err);
      setError(err.message || "Failed to update referral status");
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = STATUS_FLOW.indexOf(referral.status);
  const nextStatus = STATUS_FLOW[currentStatusIndex + 1];
  const statusConfig = STATUS_CONFIG[referral.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-[14px] font-medium text-green-700">{successMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-600" />
              <p className="text-[14px] font-medium text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-[24px] font-semibold text-gray-900">
                  {referral.client_name}
                </CardTitle>
                <Badge variant={statusConfig.variant}>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              <CardDescription className="text-[14px] text-gray-600">
                Submitted by {referral.submitter.full_name} ({referral.submitter.company_name}) on{" "}
                {new Date(referral.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Status Flow Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[18px]">Referral Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {STATUS_FLOW.map((status, index) => {
              const config = STATUS_CONFIG[status];
              const Icon = config.icon;
              const isComplete = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={status} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isComplete ? config.color : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-2 text-[12px] font-medium text-gray-700">
                      {config.label}
                    </div>
                    {isCurrent && statusConfig.nextAction && (
                      <div className="mt-1 text-[11px] text-blue-600">Current</div>
                    )}
                  </div>
                  {index < STATUS_FLOW.length - 1 && (
                    <div className="mx-4">
                      <ChevronRight
                        className={`h-5 w-5 ${isComplete ? "text-gray-400" : "text-gray-300"}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Client & Project Information */}
      <div className="grid grid-cols-2 gap-6">
        {/* Client Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-[18px]">Client Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-[14px]">
            <div>
              <div className="text-gray-500 text-[12px] mb-1">Name</div>
              <div className="font-medium">{referral.client_name}</div>
            </div>
            {referral.client_company && (
              <div>
                <div className="text-gray-500 text-[12px] mb-1">Company</div>
                <div className="font-medium">{referral.client_company}</div>
              </div>
            )}
            {referral.client_email && (
              <div>
                <div className="text-gray-500 text-[12px] mb-1">Email</div>
                <div className="font-medium">{referral.client_email}</div>
              </div>
            )}
            {referral.client_phone && (
              <div>
                <div className="text-gray-500 text-[12px] mb-1">Phone</div>
                <div className="font-medium">{referral.client_phone}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-[18px]">Project Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-[14px]">
            <div>
              <div className="text-gray-500 text-[12px] mb-1">Project Type</div>
              <div className="font-medium">{referral.project_type}</div>
            </div>
            <div>
              <div className="text-gray-500 text-[12px] mb-1">Location</div>
              <div className="font-medium">{referral.location}</div>
            </div>
            {referral.value_range && (
              <div>
                <div className="text-gray-500 text-[12px] mb-1">Value Range</div>
                <div className="font-medium">{referral.value_range}</div>
              </div>
            )}
            {referral.timeline && (
              <div>
                <div className="text-gray-500 text-[12px] mb-1">Timeline</div>
                <div className="font-medium">{referral.timeline}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Project Description */}
      {referral.project_description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[18px]">Project Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] text-gray-700">{referral.project_description}</p>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      {referral.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[18px]">Additional Context</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] text-gray-700">{referral.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Member Matching (Only show when status is REVIEWED) */}
      {referral.status === "REVIEWED" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-[18px]">Match to Member</CardTitle>
            <CardDescription>Select a member to assign this referral to</CardDescription>
          </CardHeader>
          <CardContent>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full h-10 border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-[14px] border px-3 py-2"
            >
              <option value="">Select a member...</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.full_name} - {member.company_name} ({member.primary_trade})
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      )}

      {/* Matched Member Info */}
      {referral.matched_member && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-[18px]">Matched Member</CardTitle>
          </CardHeader>
          <CardContent className="text-[14px]">
            <div className="font-semibold text-blue-900">
              {referral.matched_member.full_name}
            </div>
            <div className="text-blue-700">{referral.matched_member.company_name}</div>
            <div className="text-blue-600 text-[13px] mt-1">
              {referral.matched_member.primary_trade}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-[18px]">Admin Notes</CardTitle>
          </div>
          <CardDescription>Internal notes about this referral</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={4}
            className="w-full border-gray-300 rounded-md shadow-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-[14px] border px-3 py-2"
            placeholder="Add notes about this referral..."
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            {nextStatus && (
              <Button
                onClick={() => {
                  if (nextStatus === "MATCHED") {
                    if (!selectedMember) {
                      alert("Please select a member to match this referral to");
                      return;
                    }
                    handleStatusTransition(nextStatus, selectedMember);
                  } else {
                    handleStatusTransition(nextStatus);
                  }
                }}
                disabled={loading || (nextStatus === "MATCHED" && !selectedMember)}
                variant="default"
              >
                {statusConfig.nextAction}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
