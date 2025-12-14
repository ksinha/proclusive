import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MemberDashboard from "@/components/dashboard/MemberDashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }

  // Check if user is admin
  if (profile?.is_admin) {
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
    console.error("Error fetching application:", appError);
  }

  return (
    <MemberDashboard
      profile={profile}
      application={application}
      userId={user.id}
    />
  );
}
