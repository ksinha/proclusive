import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ReferralsList from "@/components/admin/ReferralsList";
import { Profile } from "@/types/database.types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReferralsPage() {
  console.log("[AdminReferralsPage] Loading admin referrals page...");

  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("[AdminReferralsPage] Auth error:", authError);
      redirect("/auth/login");
    }

    if (!user) {
      console.log("[AdminReferralsPage] No user found, redirecting to login");
      redirect("/auth/login");
    }

    console.log("[AdminReferralsPage] User authenticated:", user.id);

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[AdminReferralsPage] Profile error:", profileError);
    }

    if (!profile || !profile.is_admin) {
      console.log("[AdminReferralsPage] User is not admin, redirecting to dashboard");
      redirect("/dashboard");
    }

    console.log("[AdminReferralsPage] Admin verified");

    // Get all referrals
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false });

    if (referralsError) {
      console.error("[AdminReferralsPage] Error fetching referrals:", referralsError);
    } else {
      console.log("[AdminReferralsPage] Fetched", referrals?.length || 0, "referrals");
    }

    // Get all profiles for matching submitters and members
    const { data: allProfiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("[AdminReferralsPage] Error fetching profiles:", profilesError);
    } else {
      console.log("[AdminReferralsPage] Fetched", allProfiles?.length || 0, "profiles");
    }

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

    console.log("[AdminReferralsPage] Rendering ReferralsList");
    return (
    <div className="min-h-screen" style={{ background: '#1a1d27' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[36px] font-semibold text-white">Referral Management</h1>
          <p className="text-[15px] text-[#b0b2bc] mt-1">
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
  } catch (err) {
    console.error("[AdminReferralsPage] Unexpected error:", err);
    throw err;
  }
}
