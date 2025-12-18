"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

const VERIFIED_CACHE_KEY = "proclusive_verified_status";
const ADMIN_CACHE_KEY = "proclusive_admin_status";

// Read cached status from localStorage (runs only on client)
function getCachedStatus(): { isVerified: boolean; isAdmin: boolean } {
  if (typeof window === "undefined") {
    return { isVerified: false, isAdmin: false };
  }
  try {
    return {
      isVerified: localStorage.getItem(VERIFIED_CACHE_KEY) === "true",
      isAdmin: localStorage.getItem(ADMIN_CACHE_KEY) === "true",
    };
  } catch {
    return { isVerified: false, isAdmin: false };
  }
}

// Save status to localStorage
function setCachedStatus(isVerified: boolean, isAdmin: boolean) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VERIFIED_CACHE_KEY, isVerified ? "true" : "false");
    localStorage.setItem(ADMIN_CACHE_KEY, isAdmin ? "true" : "false");
  } catch {
    // Ignore localStorage errors
  }
}

// Clear cached status
function clearCachedStatus() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(VERIFIED_CACHE_KEY);
    localStorage.removeItem(ADMIN_CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isVerified: boolean;
  loading: boolean;
  signingOut: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isVerified: false,
  loading: true,
  signingOut: false,
  signOut: () => {},
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Show logout overlay via direct DOM manipulation (bypasses React async)
function showLogoutOverlay() {
  if (typeof document === "undefined") return;

  // Remove any existing overlay first
  const existing = document.getElementById("logout-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "logout-overlay";
  overlay.innerHTML = `
    <div style="position:fixed;inset:0;z-index:9999;background:#1a1d27;display:flex;align-items:center;justify-content:center;">
      <div style="text-align:center;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;margin-bottom:24px;">
          <svg style="animation:spin 1s linear infinite;height:40px;width:40px;color:#c9a962;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle style="opacity:0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path style="opacity:0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 style="font-size:24px;color:#f8f8fa;margin-bottom:8px;font-family:'Cormorant Garamond',Georgia,serif;">Signing Out</h2>
        <p style="font-size:14px;color:#b0b2bc;">Please wait...</p>
      </div>
    </div>
    <style>@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}</style>
  `;
  document.body.appendChild(overlay);
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize with cached values for instant UI on returning users
  const cached = getCachedStatus();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(cached.isAdmin);
  const [isVerified, setIsVerified] = useState(cached.isVerified);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Initial auth check - use getSession (fast, no network call)
    const initAuth = async () => {
      try {
        console.log("[AuthProvider] Initializing auth...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("[AuthProvider] Session error:", sessionError);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log("[AuthProvider] Session found, user:", session.user.id);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          console.log("[AuthProvider] No session found");
        }

        setLoading(false);
      } catch (err) {
        console.error("[AuthProvider] Init error:", err);
        setLoading(false);
      }
    };

    // Fetch user profile (admin status, verified status) with timeout
    const fetchUserProfile = async (userId: string) => {
      try {
        console.log("[AuthProvider] Fetching profile for:", userId);

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Profile fetch timeout")), 10000);
        });

        const fetchPromise = supabase
          .from("profiles")
          .select("is_admin, is_verified")
          .eq("id", userId)
          .single();

        const { data: profile, error: profileError } = await Promise.race([
          fetchPromise,
          timeoutPromise,
        ]) as Awaited<typeof fetchPromise>;

        if (profileError) {
          console.error("[AuthProvider] Profile fetch error:", profileError);
          // Still set loading to false so app can proceed
          return;
        }

        const adminStatus = profile?.is_admin || false;
        const verifiedStatus = profile?.is_verified || false;

        console.log("[AuthProvider] Profile loaded:", {
          is_admin: adminStatus,
          is_verified: verifiedStatus,
        });

        setIsAdmin(adminStatus);
        setIsVerified(verifiedStatus);

        // Cache status for instant UI on next visit
        setCachedStatus(verifiedStatus, adminStatus);
      } catch (err) {
        console.error("[AuthProvider] Profile fetch error:", err);
        // Don't block the app - allow it to proceed without profile data
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthProvider] Auth state changed:", event);

        if (event === "SIGNED_IN" && session?.user) {
          console.log("[AuthProvider] User signed in:", session.user.id);
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else if (event === "SIGNED_OUT") {
          console.log("[AuthProvider] User signed out");
          setUser(null);
          setIsAdmin(false);
          setIsVerified(false);
          clearCachedStatus();
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          console.log("[AuthProvider] Token refreshed");
          setUser(session.user);
        }
      }
    );

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign out - uses direct DOM manipulation for instant overlay
  const signOut = () => {
    // Prevent multiple simultaneous signout attempts
    if (signingOut) {
      console.log("[AuthProvider] SignOut already in progress, ignoring");
      return;
    }

    console.log("[AuthProvider] SignOut triggered");

    // Set signingOut state immediately
    setSigningOut(true);

    // Show overlay IMMEDIATELY via direct DOM manipulation (synchronous, bypasses React)
    showLogoutOverlay();

    // Clear localStorage cache IMMEDIATELY (synchronous)
    clearCachedStatus();

    // Clear ALL Supabase-related localStorage items
    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("sb-") || key.includes("supabase"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
        console.log("[AuthProvider] Cleared Supabase localStorage keys:", keysToRemove);
      } catch (e) {
        console.error("[AuthProvider] Error clearing localStorage:", e);
      }
    }

    // Perform the async signout
    const performSignOut = async () => {
      // Set a timeout to guarantee redirect even if Supabase call hangs
      const redirectTimeout = setTimeout(() => {
        console.log("[AuthProvider] Redirect timeout - forcing redirect");
        window.location.href = "/auth/login";
      }, 5000);

      try {
        const supabase = createClient();

        // Use scope: 'global' to sign out from all devices/tabs
        const { error } = await supabase.auth.signOut({ scope: 'global' });

        if (error) {
          console.error("[AuthProvider] Sign out error:", error);
        } else {
          console.log("[AuthProvider] Sign out successful");
        }

        // Wait a moment to ensure session is fully cleared
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error("[AuthProvider] Sign out error:", err);
      } finally {
        // Clear timeout and redirect to login page
        clearTimeout(redirectTimeout);

        // Clear React state before redirect
        setUser(null);
        setIsAdmin(false);
        setIsVerified(false);

        // Force full page reload to login page
        window.location.href = "/auth/login";
      }
    };

    performSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isVerified, loading, signingOut, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
