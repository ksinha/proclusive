import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReferralsList from "@/components/admin/ReferralsList";
import { Profile } from "@/types/database.types";

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

  // Get all referrals
  const { data: referrals, error: referralsError } = await supabase
    .from("referrals")
    .select("*")
    .order("created_at", { ascending: false });

  if (referralsError) {
    console.error("Error fetching referrals:", referralsError);
  }

  // Get all profiles for matching submitters and members
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*");

  // Create a map of profiles by ID for easy lookup
  const profileMap = new Map<string, Profile>();
  (allProfiles || []).forEach((p: Profile) => {
    profileMap.set(p.id, p);
  });

  // Enrich referrals with submitter and matched_member data
  const enrichedReferrals = (referrals || []).map((referral) => ({
    ...referral,
    submitter: profileMap.get(referral.submitted_by) || {
      id: referral.submitted_by,
      full_name: "Unknown",
      company_name: "Unknown",
      email: "",
      primary_trade: "",
      badge_level: "none",
      is_admin: false,
      is_verified: false,
      is_public: false,
      created_at: "",
      updated_at: "",
    },
    matched_member: referral.matched_to ? profileMap.get(referral.matched_to) : null,
  }));

  // Get all verified members for matching dropdown
  const members = (allProfiles || []).filter((p: Profile) => p.is_verified);

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
          referrals={enrichedReferrals}
          members={members}
        />
      </div>
    </div>
  );
}
