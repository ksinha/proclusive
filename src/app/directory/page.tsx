import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DirectoryClient from "@/components/directory/DirectoryClient";

export default async function DirectoryPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch public, verified profiles with their portfolio
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_public", true)
    .eq("is_verified", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
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

  return <DirectoryClient profiles={profiles || []} currentUserId={user.id} />;
}
