import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReferralsList from "@/components/admin/ReferralsList";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReferralsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_admin) {
    redirect("/dashboard");
  }

  // Get all referrals with submitter and matched member info
  const { data: referrals, error } = await supabase
    .from("referrals")
    .select(`
      *,
      submitter:profiles!referrals_submitted_by_fkey(*),
      matched_member:profiles!referrals_matched_to_fkey(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching referrals:", error);
  }

  // Get all approved members for matching
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_verified", true)
    .order("full_name");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[36px] font-semibold text-gray-900">Referral Management</h1>
          <p className="text-[15px] text-gray-600 mt-1">
            Review and manage member referrals through the 5-stage workflow
          </p>
        </div>

        {/* Referrals List */}
        <ReferralsList
          referrals={referrals || []}
          members={members || []}
          onRefresh={() => {
            // Client-side refresh will be handled by the component
            // For now, just reload the page
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
}
