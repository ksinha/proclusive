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
  loggingOut: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isVerified: false,
  loading: true,
  loggingOut: false,
  signOut: async () => {},
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

// Logout overlay component
function LogoutOverlay() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#1a1d27] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
          <svg
            className="animate-spin h-10 w-10 text-[#c9a962]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h2
          className="text-[24px] text-[#f8f8fa] mb-2"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Signing Out
        </h2>
        <p className="text-[14px] text-[#b0b2bc]">
          Please wait...
        </p>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize with cached values for instant UI on returning users
  const cached = getCachedStatus();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(cached.isAdmin);
  const [isVerified, setIsVerified] = useState(cached.isVerified);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

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

  const signOut = async () => {
    console.log("[AuthProvider] Signing out...");

    // Show logout overlay immediately - don't change other state yet
    // This keeps the page looking the same behind the overlay
    setLoggingOut(true);

    // Clear cached status so nav doesn't show member links after logout
    clearCachedStatus();

    // Set a timeout to guarantee redirect even if Supabase call hangs
    const redirectTimeout = setTimeout(() => {
      console.log("[AuthProvider] Redirect timeout - forcing redirect");
      window.location.href = "/";
    }, 5000);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[AuthProvider] Sign out error:", error);
      }

      // Small delay so user sees the "Signing Out" message
      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (err) {
      console.error("[AuthProvider] Sign out error:", err);
    } finally {
      // Clear timeout and redirect
      clearTimeout(redirectTimeout);
      // Force full page reload to clear any cached state
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isVerified, loading, loggingOut, signOut }}>
      {loggingOut && <LogoutOverlay />}
      {children}
    </AuthContext.Provider>
  );
}
