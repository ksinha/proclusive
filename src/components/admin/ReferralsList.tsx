"use client";

import { useState } from "react";
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
  Filter,
} from "lucide-react";
import ReferralDetail from "./ReferralDetail";

interface ReferralWithProfile extends Referral {
  submitter: Profile;
  matched_member?: Profile | null;
}

interface ReferralsListProps {
  referrals: ReferralWithProfile[];
  members: Profile[];
}

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    variant: "secondary" as const,
    icon: FileText,
  },
  REVIEWED: {
    label: "Reviewed",
    variant: "warning" as const,
    icon: CheckCircle,
  },
  MATCHED: {
    label: "Matched",
    variant: "info" as const,
    icon: UserCheck,
  },
  ENGAGED: {
    label: "Engaged",
    variant: "success" as const,
    icon: Briefcase,
  },
  COMPLETED: {
    label: "Completed",
    variant: "success" as const,
    icon: CheckCircle2,
  },
};

const ALL_STATUSES: ReferralStatus[] = ["SUBMITTED", "REVIEWED", "MATCHED", "ENGAGED", "COMPLETED"];

export default function ReferralsList({ referrals, members }: ReferralsListProps) {
  const [selectedReferral, setSelectedReferral] = useState<ReferralWithProfile | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | "ALL">("ALL");

  const filteredReferrals =
    statusFilter === "ALL"
      ? referrals
      : referrals.filter((r) => r.status === statusFilter);

  const getStatusCount = (status: ReferralStatus) => {
    return referrals.filter((r) => r.status === status).length;
  };

  if (selectedReferral) {
    return (
      <ReferralDetail
        referral={selectedReferral}
        members={members}
        onClose={() => setSelectedReferral(null)}
        onUpdate={() => {
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        {ALL_STATUSES.map((status) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const count = getStatusCount(status);

          return (
            <Card
              key={status}
              className={`cursor-pointer transition-all ${
                statusFilter === status
                  ? "ring-2 ring-blue-500 shadow-md"
                  : "hover:shadow-md"
              }`}
              onClick={() => setStatusFilter(status)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-[24px] font-bold text-gray-900">{count}</div>
                    <div className="text-[12px] text-gray-600">{config.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[14px] text-gray-700">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter by status:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ALL")}
              >
                All ({referrals.length})
              </Button>
              {ALL_STATUSES.map((status) => {
                const config = STATUS_CONFIG[status];
                return (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                  >
                    {config.label} ({getStatusCount(status)})
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      {filteredReferrals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-[18px] font-semibold text-gray-900 mb-2">
              No referrals {statusFilter !== "ALL" ? `with status "${STATUS_CONFIG[statusFilter].label}"` : "yet"}
            </h3>
            <p className="text-[14px] text-gray-600">
              {statusFilter !== "ALL"
                ? "Try adjusting your filter"
                : "Referrals will appear here when members submit them"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReferrals.map((referral) => {
            const statusConfig = STATUS_CONFIG[referral.status];
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={referral.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReferral(referral)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-[20px] font-semibold text-gray-900">
                          {referral.client_name}
                        </CardTitle>
                        <Badge variant={statusConfig.variant}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <CardDescription className="text-[14px] text-gray-600">
                        Submitted by {referral.submitter.full_name} ({referral.submitter.company_name})
                        {referral.client_company && ` • ${referral.client_company}`}
                      </CardDescription>
                    </div>
                    <div className="text-right text-[13px] text-gray-500">
                      <div>Submitted</div>
                      <div>{new Date(referral.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-6 text-[13px]">
                    <div>
                      <div className="font-medium text-gray-700 mb-1">Project Type</div>
                      <div className="text-gray-600">{referral.project_type}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700 mb-1">Location</div>
                      <div className="text-gray-600">{referral.location}</div>
                    </div>
                    {referral.value_range && (
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Value Range</div>
                        <div className="text-gray-600">{referral.value_range}</div>
                      </div>
                    )}
                    {referral.timeline && (
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Timeline</div>
                        <div className="text-gray-600">{referral.timeline}</div>
                      </div>
                    )}
                  </div>

                  {referral.matched_member && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-[13px]">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-700">Matched to:</span>
                        <span className="text-gray-900">
                          {referral.matched_member.full_name} ({referral.matched_member.company_name})
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
