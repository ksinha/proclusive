import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DirectoryClient from "@/components/directory/DirectoryClient";

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

    // Fetch public, verified profiles with their portfolio
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

    console.log("[DirectoryPage] Fetched", profiles?.length || 0, "profiles");
    return <DirectoryClient profiles={profiles || []} currentUserId={user.id} />;
  } catch (err) {
    console.error("[DirectoryPage] Unexpected error:", err);
    throw err;
  }
}
