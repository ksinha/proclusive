import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, CheckCircle, Clock, UserCheck, Briefcase, CheckCircle2 } from "lucide-react";
import { Referral } from "@/types/database.types";

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Submitted",
    variant: "secondary" as const,
    icon: FileText,
    color: "text-gray-600",
  },
  REVIEWED: {
    label: "Reviewed",
    variant: "warning" as const,
    icon: CheckCircle,
    color: "text-yellow-600",
  },
  MATCHED: {
    label: "Matched",
    variant: "info" as const,
    icon: UserCheck,
    color: "text-blue-600",
  },
  ENGAGED: {
    label: "Engaged",
    variant: "success" as const,
    icon: Briefcase,
    color: "text-green-600",
  },
  COMPLETED: {
    label: "Completed",
    variant: "success" as const,
    icon: CheckCircle2,
    color: "text-green-700",
  },
};

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  console.log("[ReferralsPage] Loading referrals page...");

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("[ReferralsPage] Auth error:", authError);
      redirect("/auth/login");
    }

    if (!user) {
      console.log("[ReferralsPage] No user found, redirecting to login");
      redirect("/auth/login");
    }

    console.log("[ReferralsPage] User authenticated:", user.id);

    // Get user's referrals
    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("*")
      .eq("submitted_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ReferralsPage] Error fetching referrals:", error);
    } else {
      console.log("[ReferralsPage] Fetched", referrals?.length || 0, "referrals");
    }

    const success = searchParams.success === "true";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <Card className="bg-green-50 border-green-200 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-[14px] font-medium text-green-700">
                  Referral submitted successfully! Our admin team will review it shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-semibold text-gray-900">My Referrals</h1>
            <p className="text-sm sm:text-[15px] text-gray-600 mt-1">
              Track the status of your submitted referrals
            </p>
          </div>
          <Link href="/dashboard/referrals/new" className="sm:flex-shrink-0">
            <Button variant="default" className="h-10 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Referral
            </Button>
          </Link>
        </div>

        {/* Referrals List */}
        {!referrals || referrals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-sm text-gray-600 mb-6">
                Start referring clients to the Proclusive network
              </p>
              <Link href="/dashboard/referrals/new">
                <Button variant="default">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Referral
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral: Referral) => {
              const statusConfig = STATUS_CONFIG[referral.status];
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={referral.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                            {referral.client_name}
                          </CardTitle>
                          <Badge variant={statusConfig.variant} className="self-start">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm text-gray-600">
                          {referral.client_company && `${referral.client_company} • `}
                          {referral.project_type}
                        </CardDescription>
                      </div>
                      <div className="text-left sm:text-right text-xs sm:text-[13px] text-gray-500 flex-shrink-0">
                        <div>Submitted</div>
                        <div>{new Date(referral.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-[13px]">
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

                    {referral.project_description && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="font-medium text-gray-700 text-xs sm:text-[13px] mb-1">
                          Project Description
                        </div>
                        <div className="text-gray-600 text-xs sm:text-[13px]">
                          {referral.project_description}
                        </div>
                      </div>
                    )}

                    {referral.admin_notes && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="font-medium text-gray-700 text-xs sm:text-[13px] mb-1">
                          Admin Notes
                        </div>
                        <div className="text-gray-600 text-xs sm:text-[13px] bg-blue-50 p-3 rounded-lg border border-blue-100">
                          {referral.admin_notes}
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
    </div>
  );
  } catch (err) {
    console.error("[ReferralsPage] Unexpected error:", err);
    throw err;
  }
}
