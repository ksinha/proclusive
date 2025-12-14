"use client";

import Link from "next/link";
import { Profile, Application, ApplicationStatus, BadgeLevel } from "@/types/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GitBranch, Award, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberDashboardProps {
  profile: Profile | null;
  application: Application | null;
  userId: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { variant: "warning" | "default" | "success" | "destructive"; icon: any; message: string }
> = {
  pending: {
    variant: "warning",
    icon: Clock,
    message: "Your application is pending review by our admin team.",
  },
  under_review: {
    variant: "default",
    icon: AlertCircle,
    message: "Your application is currently under review.",
  },
  approved: {
    variant: "success",
    icon: CheckCircle2,
    message: "Congratulations! Your application has been approved.",
  },
  rejected: {
    variant: "destructive",
    icon: XCircle,
    message: "Your application was not approved. Please contact support for details.",
  },
};

const BADGE_VARIANTS: Record<BadgeLevel, any> = {
  none: "secondary",
  compliance: "compliance",
  capability: "capability",
  reputation: "reputation",
  enterprise: "enterprise",
};

const BADGE_LABELS: Record<BadgeLevel, string> = {
  none: "No Badge",
  compliance: "Compliance Badge",
  capability: "Capability Badge",
  reputation: "Reputation Badge",
  enterprise: "Enterprise Badge",
};

export default function MemberDashboard({
  profile,
  application,
  userId,
}: MemberDashboardProps) {
  if (!profile) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle className="text-[24px]">Complete Your Profile</CardTitle>
            <CardDescription className="text-[14px] mt-2">
              Get started by completing the vetting process to join the Proclusive network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vetting">
              <Button size="lg" className="mt-4">
                Start Vetting Process
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = application ? STATUS_CONFIG[application.status] : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 -mx-6 px-6 py-6 mb-8">
          <h1 className="text-[28px] font-semibold text-gray-900">
            Welcome back, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="text-[14px] text-gray-600 mt-1">{profile.company_name}</p>
        </div>

        {/* Verification Status Card */}
        {application && statusConfig && (
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h2 className="text-[18px] font-semibold text-gray-900">Verification Status</h2>
                    <Badge variant={statusConfig.variant}>
                      {application.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-[14px] text-gray-600">{statusConfig.message}</p>
                </div>

                {application.status === "approved" && profile.badge_level !== "none" && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="text-[14px] font-medium text-gray-900">Badge Earned:</span>
                    <Badge variant={BADGE_VARIANTS[profile.badge_level]}>
                      {BADGE_LABELS[profile.badge_level]}
                    </Badge>
                  </div>
                )}

                {application.admin_notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                    <p className="text-[13px] font-medium text-gray-900 mb-1">Admin Notes:</p>
                    <p className="text-[13px] text-gray-600">{application.admin_notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-[20px] font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Directory Card */}
            <Link href="/directory" className="group">
              <Card hover className="h-full">
                <CardContent className="pt-6">
                  <Users className="h-6 w-6 text-blue-600 mb-4" />
                  <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
                    Member Directory
                  </h3>
                  <p className="text-[13px] text-gray-600">
                    Browse and connect with verified professionals
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Referrals Card (Coming Soon) */}
            <Card className="opacity-60">
              <CardContent className="pt-6">
                <GitBranch className="h-6 w-6 text-blue-600 mb-4" />
                <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
                  Referrals
                </h3>
                <p className="text-[13px] text-gray-600">
                  Submit and manage B2B referrals
                </p>
                <Badge variant="secondary" className="mt-3 bg-gray-100 text-gray-600">Coming Soon</Badge>
              </CardContent>
            </Card>

            {/* Badge Progress Card (Coming Soon) */}
            <Card className="opacity-60">
              <CardContent className="pt-6">
                <Award className="h-6 w-6 text-blue-600 mb-4" />
                <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
                  Advance Your Badge
                </h3>
                <p className="text-[13px] text-gray-600">
                  Complete additional tiers to earn higher badges
                </p>
                <Badge variant="secondary" className="mt-3 bg-gray-100 text-gray-600">Coming Soon</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
            <CardDescription>Your membership information at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-[14px] font-medium text-gray-900">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                <p className="text-[14px] font-medium text-gray-900">{profile.phone || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Primary Trade</p>
                <Badge variant="outline">{profile.primary_trade}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Location</p>
                <p className="text-[14px] font-medium text-gray-900">
                  {profile.city}
                  {profile.city && profile.state && ", "}
                  {profile.state}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Years in Business</p>
                <p className="text-[14px] font-medium text-gray-900">{profile.years_in_business || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Profile Visibility</p>
                <Badge variant={profile.is_public ? "success" : "secondary"}>
                  {profile.is_public ? "Public" : "Private"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
