import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DirectoryClient from "@/components/directory/DirectoryClient";
import { BadgeLevel } from "@/types/database.types";

export default async function DirectoryPage() {
  console.log("[DirectoryPage] Loading directory page...");

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("[DirectoryPage] Auth error:", authError);
      redirect("/auth/login");
    }

    if (!user) {
      console.log("[DirectoryPage] No user found, redirecting to login");
      redirect("/auth/login");
    }

    console.log("[DirectoryPage] User authenticated:", user.id);

    // Check if user is verified or admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[DirectoryPage] Profile error:", profileError);
    }

    // Only verified users or admins can access the directory
    if (!currentUserProfile || (!currentUserProfile.is_verified && !currentUserProfile.is_admin)) {
      console.log("[DirectoryPage] User is not verified or admin, redirecting to dashboard");
      redirect("/dashboard");
    }

    console.log("[DirectoryPage] User access verified:", {
      is_verified: currentUserProfile.is_verified,
      is_admin: currentUserProfile.is_admin
    });

    // Fetch public, verified profiles
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_public", true)
      .eq("is_verified", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[DirectoryPage] Error fetching profiles:", error);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              Error Loading Directory
            </h1>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      );
    }

    // Fetch all user_badges for these profiles
    const profileIds = profiles?.map(p => p.id) || [];
    let userBadgesMap: Record<string, BadgeLevel[]> = {};

    if (profileIds.length > 0) {
      const { data: userBadges, error: badgesError } = await supabase
        .from("user_badges")
        .select("user_id, badge_level")
        .in("user_id", profileIds);

      if (!badgesError && userBadges) {
        // Build a map of user_id -> badges[]
        for (const badge of userBadges) {
          if (!userBadgesMap[badge.user_id]) {
            userBadgesMap[badge.user_id] = [];
          }
          userBadgesMap[badge.user_id].push(badge.badge_level as BadgeLevel);
        }
      }
    }

    console.log("[DirectoryPage] Fetched", profiles?.length || 0, "profiles");
    return (
      <DirectoryClient
        profiles={profiles || []}
        currentUserId={user.id}
        userBadgesMap={userBadgesMap}
      />
    );
  } catch (err) {
    console.error("[DirectoryPage] Unexpected error:", err);
    throw err;
  }
}
