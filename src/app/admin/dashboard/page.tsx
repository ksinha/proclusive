"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ApplicationWithProfile extends Application {
  profile: Profile;
}

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const [allApplications, setAllApplications] = useState<ApplicationWithProfile[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "under_review" | "approved" | "rejected">("pending");
  const [isViewingIndividual, setIsViewingIndividual] = useState(false);

  // Refs for preventing race conditions and memory leaks
  const isMountedRef = useRef(true);
  const isLoadingRef = useRef(false);

  // Optimistic data loading - start immediately on mount
  // Supabase client uses stored session independently of React auth state
  // RLS policies will return empty data if user is not admin
  useEffect(() => {
    console.log("[AdminDashboard] Starting optimistic data load");
    loadApplications();

    // Cleanup: mark as unmounted to prevent state updates after unmount
    return () => {
      console.log("[AdminDashboard] Component unmounting");
      isMountedRef.current = false;
    };
  }, []);

  // Auth validation and redirect (runs in parallel with data loading)
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

      console.log("[AdminDashboard] Admin verified");
    }
  }, [authLoading, user, isAdmin]);


  const loadApplications = async () => {
    // Issue 3 fix: Prevent concurrent loads
    if (isLoadingRef.current) {
      console.log("[AdminDashboard] Load already in progress, skipping");
      return;
    }

    console.log("[AdminDashboard] Loading all applications");
    isLoadingRef.current = true;

    // Only update state if still mounted
    if (isMountedRef.current) {
      setDataLoading(true);
    }

    try {
      const supabase = createClient();

      // Single query with join - fetches applications with profiles in one request
      // The foreign key relationship allows Supabase to join the data automatically
      const { data: apps, error: appsError } = await supabase
        .from("applications")
        .select("*, profile:profiles!applications_user_id_fkey(*)")
        .order("created_at", { ascending: false });

      // Issue 5 fix: Check if still mounted before state updates
      if (!isMountedRef.current) {
        console.log("[AdminDashboard] Component unmounted, skipping state update");
        return;
      }

      if (appsError) {
        console.error("[AdminDashboard] Error loading applications:", appsError);
        return;
      }

      if (!apps || apps.length === 0) {
        console.log("[AdminDashboard] No applications found");
        setAllApplications([]);
        return;
      }

      console.log("[AdminDashboard] Loaded", apps.length, "applications");
      setAllApplications(apps as ApplicationWithProfile[]);
    } catch (err) {
      console.error("[AdminDashboard] Error loading applications:", err);
    } finally {
      isLoadingRef.current = false;
      // Only update loading state if still mounted
      if (isMountedRef.current) {
        setDataLoading(false);
      }
    }
  };

  // Filter applications client-side based on selected filter
  const filteredApplications = filter === "all"
    ? allApplications
    : allApplications.filter((app) => app.status === filter);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#1a1d27' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a962] mx-auto"></div>
          <p className="mt-4 text-[14px] text-[#b0b2bc]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#1a1d27' }}>
      {/* Header */}
      <div style={{ background: '#252833', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-[#c9a962] flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-semibold text-white truncate">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-[#6a6d78] hidden sm:block">Proclusive Vetting System</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ background: '#1a1d27', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Applications */}
            <div style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px' }}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#282c38' }}>
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#c9a962]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Total Applications</p>
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white font-tabular-nums">{allApplications.length}</p>
                </div>
              </div>
            </div>

            {/* Pending Review */}
            <div style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px' }}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#282c38' }}>
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-[#60a5fa]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Pending Review</p>
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white font-tabular-nums">
                    {allApplications.filter((a) => a.status === "pending").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Under Review */}
            <div style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px' }}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#282c38' }}>
                  <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#fbbf24]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Under Review</p>
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white font-tabular-nums">
                    {allApplications.filter((a) => a.status === "under_review").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Approved */}
            <div style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '16px' }}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#282c38' }}>
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#4ade80]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[12px] font-medium text-[#6a6d78] uppercase tracking-wide">Approved</p>
                  <p className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white font-tabular-nums">
                    {allApplications.filter((a) => a.status === "approved").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section - Only show when NOT viewing individual application */}
      {!isViewingIndividual && (
        <div style={{ background: '#1a1d27', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
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
      )}

      {/* Applications Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6" style={{ background: '#1a1d27' }}>
        <ApplicationsList
          applications={filteredApplications}
          onUpdate={loadApplications}
          onViewingChange={setIsViewingIndividual}
        />
      </div>
    </div>
  );
}
