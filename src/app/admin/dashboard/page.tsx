"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Application, Profile } from "@/types/database.types";
import ApplicationsList from "@/components/admin/ApplicationsList";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  LogOut,
} from "lucide-react";

interface ApplicationWithProfile extends Application {
  profile: Profile;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "under_review" | "approved" | "rejected">("pending");

  useEffect(() => {
    checkAdminAuth();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadApplications();
    }
  }, [filter, loading]);

  const checkAdminAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      router.push("/dashboard");
      return;
    }

    setLoading(false);
  };

  const loadApplications = async () => {
    const supabase = createClient();

    // First get applications
    let appQuery = supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      appQuery = appQuery.eq("status", filter);
    }

    const { data: apps, error: appsError } = await appQuery;

    if (appsError) {
      console.error("Error loading applications:", appsError);
      return;
    }

    if (!apps || apps.length === 0) {
      setApplications([]);
      return;
    }

    // Get user IDs
    const userIds = apps.map((app) => app.user_id);

    // Get profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error loading profiles:", profilesError);
      return;
    }

    // Combine data
    const combined = apps.map((app) => ({
      ...app,
      profile: profiles?.find((p) => p.id === app.user_id),
    }));

    setApplications(combined as any);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-[14px] text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navy Header */}
      <div className="bg-navy-800 border-b border-navy-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-blue-400" />
              <div>
                <h1 className="text-[28px] font-semibold text-white">Admin Dashboard</h1>
                <p className="text-[14px] text-gray-400">Proclusive Vetting System</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="border-navy-600 bg-navy-700 hover:bg-navy-600 text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-4 gap-6">
            {/* Total Applications */}
            <div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Total Applications</p>
                  <p className="text-[32px] font-bold text-gray-900 font-tabular-nums">{applications.length}</p>
                </div>
              </div>
            </div>

            {/* Pending Review */}
            <div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Pending Review</p>
                  <p className="text-[32px] font-bold text-gray-900 font-tabular-nums">
                    {applications.filter((a) => a.status === "pending").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Under Review */}
            <div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Under Review</p>
                  <p className="text-[32px] font-bold text-gray-900 font-tabular-nums">
                    {applications.filter((a) => a.status === "under_review").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Approved */}
            <div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Approved</p>
                  <p className="text-[32px] font-bold text-gray-900 font-tabular-nums">
                    {applications.filter((a) => a.status === "approved").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            {["all", "pending", "under_review", "approved", "rejected"].map((status) => (
              <Button
                key={status}
                onClick={() => setFilter(status as any)}
                variant={filter === status ? "default" : "outline"}
                size="sm"
              >
                {status.replace("_", " ").charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="max-w-7xl mx-auto px-6 py-6 bg-white">
        <ApplicationsList applications={applications} onUpdate={loadApplications} />
      </div>
    </div>
  );
}
