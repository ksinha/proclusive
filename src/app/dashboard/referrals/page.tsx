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
    <div className="min-h-screen" style={{ background: '#1a1d27' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Success Message */}
        {success && (
          <Card className="mb-6" style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', borderRadius: '10px' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5" style={{ color: '#4ade80' }} />
                <p className="text-[14px] font-medium" style={{ color: '#4ade80' }}>
                  Referral submitted successfully! Our admin team will review it shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[36px]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>My Referrals</h1>
            <p className="text-sm sm:text-[15px] mt-1" style={{ color: '#b0b2bc' }}>
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
          <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: '#6a6d78' }} />
              <h3 className="text-base sm:text-lg mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>No referrals yet</h3>
              <p className="text-sm mb-6" style={{ color: '#b0b2bc' }}>
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
                <Card key={referral.id} className="hover:shadow-md transition-shadow" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <CardTitle className="text-lg sm:text-xl truncate" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>
                            {referral.client_name}
                          </CardTitle>
                          <Badge variant={statusConfig.variant} className="self-start">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm" style={{ color: '#b0b2bc' }}>
                          {referral.client_company && `${referral.client_company} • `}
                          {referral.project_type}
                        </CardDescription>
                      </div>
                      <div className="text-left sm:text-right text-xs sm:text-[13px] flex-shrink-0" style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        <div>Submitted</div>
                        <div>{new Date(referral.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-xs sm:text-[13px]">
                      <div>
                        <div className="font-medium mb-1" style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Location</div>
                        <div style={{ color: '#b0b2bc' }}>{referral.location}</div>
                      </div>
                      {referral.value_range && (
                        <div>
                          <div className="font-medium mb-1" style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Value Range</div>
                          <div style={{ color: '#b0b2bc' }}>{referral.value_range}</div>
                        </div>
                      )}
                      {referral.timeline && (
                        <div>
                          <div className="font-medium mb-1" style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.75rem' }}>Timeline</div>
                          <div style={{ color: '#b0b2bc' }}>{referral.timeline}</div>
                        </div>
                      )}
                    </div>

                    {referral.project_description && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div className="font-medium text-xs sm:text-[13px] mb-1" style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Project Description
                        </div>
                        <div className="text-xs sm:text-[13px]" style={{ color: '#b0b2bc' }}>
                          {referral.project_description}
                        </div>
                      </div>
                    )}

                    {referral.admin_notes && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div className="font-medium text-xs sm:text-[13px] mb-1" style={{ color: '#6a6d78', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Admin Notes
                        </div>
                        <div className="text-xs sm:text-[13px] p-3 rounded-lg" style={{ color: '#b0b2bc', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)' }}>
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
