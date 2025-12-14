"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[Navigation] Checking auth state...");
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError) {
          console.error("[Navigation] Auth error:", authError);
          setIsLoggedIn(false);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (user) {
          console.log("[Navigation] User found:", user.id);
          setIsLoggedIn(true);

          // Check if user is admin
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("[Navigation] Profile fetch error:", profileError);
            setIsAdmin(false);
          } else {
            console.log("[Navigation] Profile found, is_admin:", profile?.is_admin);
            setIsAdmin(profile?.is_admin || false);
          }
        } else {
          console.log("[Navigation] No user found");
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("[Navigation] Unexpected error in checkAuth:", err);
        setIsLoggedIn(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("[Navigation] Auth state changed:", event);
        setIsLoggedIn(!!session?.user);

        if (session?.user) {
          console.log("[Navigation] Session user:", session.user.id);
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("[Navigation] Profile fetch error in auth change:", profileError);
            setIsAdmin(false);
          } else {
            setIsAdmin(profile?.is_admin || false);
          }
        } else {
          console.log("[Navigation] No session user");
          setIsAdmin(false);
        }
      } catch (err) {
        console.error("[Navigation] Error in auth state change handler:", err);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      console.log("[Navigation] Logging out...");
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("[Navigation] Logout error:", error);
      }

      setIsAdmin(false);
      setIsLoggedIn(false);
      console.log("[Navigation] Logout successful, redirecting...");
      window.location.href = "/";
    } catch (err) {
      console.error("[Navigation] Unexpected error in logout:", err);
      // Force redirect even on error
      window.location.href = "/";
    }
  };

  // Determine the correct links based on role
  const dashboardLink = isAdmin ? "/admin/dashboard" : "/dashboard";
  const referralsLink = isAdmin ? "/admin/referrals" : "/dashboard/referrals";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center">
            <span className="text-[22px] font-bold text-navy-800">Proclusive</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!loading && (
              <>
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/directory"
                      className={`text-[14px] font-medium transition-colors ${
                        pathname === "/directory"
                          ? "text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Directory
                    </Link>
                    <Link
                      href={referralsLink}
                      className={`text-[14px] font-medium transition-colors ${
                        pathname.includes("/referrals")
                          ? "text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Referrals
                    </Link>
                    <Button asChild variant="cta">
                      <Link href={dashboardLink}>Dashboard</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className={`text-[14px] font-medium transition-colors ${
                        pathname === "/auth/login"
                          ? "text-gray-900"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Login
                    </Link>
                    <Button asChild variant="cta">
                      <Link href="/auth/signup">Apply to Join</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 py-4 space-y-4">
            {!loading && (
              <>
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/directory"
                      className="block text-[14px] font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Directory
                    </Link>
                    <Link
                      href={referralsLink}
                      className="block text-[14px] font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Referrals
                    </Link>
                    <Button asChild variant="cta" className="w-full">
                      <Link href={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block text-[14px] font-medium text-gray-600 hover:text-gray-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Button asChild variant="cta" className="w-full">
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                        Apply to Join
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
