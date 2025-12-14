import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MemberDashboard from "@/components/dashboard/MemberDashboard";

export default async function DashboardPage() {
  console.log("[DashboardPage] Loading dashboard...");

  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("[DashboardPage] Auth error:", authError);
      redirect("/auth/login");
    }

    if (!user) {
      console.log("[DashboardPage] No user found, redirecting to login");
      redirect("/auth/login");
    }

    console.log("[DashboardPage] User authenticated:", user.id);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("[DashboardPage] Error fetching profile:", profileError);
    } else {
      console.log("[DashboardPage] Profile fetched:", profile?.id, "is_admin:", profile?.is_admin);
    }

    // Check if user is admin
    if (profile?.is_admin) {
      console.log("[DashboardPage] User is admin, redirecting to admin dashboard");
      redirect("/admin/dashboard");
    }

    // Fetch user's application status
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (appError && appError.code !== "PGRST116") {
      console.error("[DashboardPage] Error fetching application:", appError);
    } else if (application) {
      console.log("[DashboardPage] Application found:", application.id, "status:", application.status);
    }

    console.log("[DashboardPage] Rendering MemberDashboard");
    return (
      <MemberDashboard
        profile={profile}
        application={application}
        userId={user.id}
      />
    );
  } catch (err) {
    console.error("[DashboardPage] Unexpected error:", err);
    throw err; // Re-throw to let Next.js error handling take over
  }
}
