"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isVerified: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isVerified: false,
  loading: true,
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

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

    // Fetch user profile (admin status, verified status)
    const fetchUserProfile = async (userId: string) => {
      try {
        console.log("[AuthProvider] Fetching profile for:", userId);
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_admin, is_verified")
          .eq("id", userId)
          .single();

        if (profileError) {
          console.error("[AuthProvider] Profile fetch error:", profileError);
          return;
        }

        console.log("[AuthProvider] Profile loaded:", {
          is_admin: profile?.is_admin,
          is_verified: profile?.is_verified,
        });

        setIsAdmin(profile?.is_admin || false);
        setIsVerified(profile?.is_verified || false);
      } catch (err) {
        console.error("[AuthProvider] Profile fetch error:", err);
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
    try {
      console.log("[AuthProvider] Signing out...");
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[AuthProvider] Sign out error:", error);
      }

      setUser(null);
      setIsAdmin(false);
      setIsVerified(false);

      // Force full page reload to clear any cached state
      window.location.href = "/";
    } catch (err) {
      console.error("[AuthProvider] Sign out error:", err);
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isVerified, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
