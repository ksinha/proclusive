"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

interface ApplicationWithProfile extends Application {
  profile: Profile;
}

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationWithProfile[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "under_review" | "approved" | "rejected">("pending");

  // Redirect logic based on auth state
  useEffect(() => {
    if (!authLoading) {
      console.log("[AdminDashboard] Auth loaded:", { user: user?.id, isAdmin });

      if (!user) {
        console.log("[AdminDashboard] No user, redirecting to login");
        window.location.href = "/auth/login";
        return;
      }

      if (!isAdmin) {
        console.log("[AdminDashboard] Not admin, redirecting to member dashboard");
        window.location.href = "/dashboard";
        return;
      }

      // User is authenticated and is admin, load applications
      console.log("[AdminDashboard] Admin verified, loading applications");
      loadApplications();
    }
  }, [authLoading, user, isAdmin]);

  // Reload applications when filter changes
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      loadApplications();
    }
  }, [filter]);

  const loadApplications = async () => {
    console.log("[AdminDashboard] Loading applications with filter:", filter);
    setDataLoading(true);

    try {
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
        console.error("[AdminDashboard] Error loading applications:", appsError);
        setDataLoading(false);
        return;
      }

      if (!apps || apps.length === 0) {
        console.log("[AdminDashboard] No applications found");
        setApplications([]);
        setDataLoading(false);
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
        console.error("[AdminDashboard] Error loading profiles:", profilesError);
        setDataLoading(false);
        return;
      }

      // Combine data
      const combined = apps.map((app) => ({
        ...app,
        profile: profiles?.find((p) => p.id === app.user_id),
      }));

      console.log("[AdminDashboard] Loaded", combined.length, "applications");
      setApplications(combined as any);
    } catch (err) {
      console.error("[AdminDashboard] Error loading applications:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-[28px] font-semibold text-white truncate">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">Proclusive Vetting System</p>
              </div>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="border-navy-600 bg-navy-700 hover:bg-navy-600 text-white flex-shrink-0"
            >
              <LogOut className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Applications */}
            <div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-medium text-gray-500 uppercase tracking-wide">Total Applications</p>
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-gray-900 font-tabular-nums">{applications.length}</p>
                </div>
              </div>
            </div>

            {/* Pending Review */}
            <div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-medium text-gray-500 uppercase tracking-wide">Pending Review</p>
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-gray-900 font-tabular-nums">
                    {applications.filter((a) => a.status === "pending").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Under Review */}
            <div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-medium text-gray-500 uppercase tracking-wide">Under Review</p>
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-gray-900 font-tabular-nums">
                    {applications.filter((a) => a.status === "under_review").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Approved */}
            <div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-medium text-gray-500 uppercase tracking-wide">Approved</p>
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-gray-900 font-tabular-nums">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap gap-2">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 bg-white">
        <ApplicationsList applications={applications} onUpdate={loadApplications} />
      </div>
    </div>
  );
}
