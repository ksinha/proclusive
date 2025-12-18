"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isVerified, loading, signingOut, signOut } = useAuth();

  const isLoggedIn = !!user;
  // Only show Directory and Referrals to verified/approved users or admins
  // isVerified/isAdmin are initialized from localStorage cache for instant UI,
  // then updated from server when profile loads
  const canAccessMemberFeatures = isVerified || isAdmin;

  // Determine the correct links based on role
  const dashboardLink = isAdmin ? "/admin/dashboard" : "/dashboard";
  const referralsLink = isAdmin ? "/admin/referrals" : "/dashboard/referrals";

  return (
    <header className="sticky top-0 z-50 bg-[#21242f] backdrop-blur-[10px] border-b border-white/[0.08] px-[30px] py-[18px] sm:py-5">
      <nav className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center">
            <span className="text-[1.4rem] font-serif text-[#f8f8fa] tracking-[0.2em] uppercase" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Proclusive</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <>
                {canAccessMemberFeatures && (
                  <>
                    <Link
                      href="/directory"
                      className={`text-[0.85rem] tracking-[0.02em] transition-colors duration-300 relative group ${
                        pathname === "/directory"
                          ? "text-[#c9a962]"
                          : "text-[#b0b2bc] hover:text-[#c9a962]"
                      }`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Directory
                      <span className={`absolute bottom-[-4px] left-0 h-[1px] bg-[#c9a962] transition-all duration-300 ${
                        pathname === "/directory" ? "w-full" : "w-0 group-hover:w-full"
                      }`}></span>
                    </Link>
                    <Link
                      href={referralsLink}
                      className={`text-[0.85rem] tracking-[0.02em] transition-colors duration-300 relative group ${
                        pathname.includes("/referrals")
                          ? "text-[#c9a962]"
                          : "text-[#b0b2bc] hover:text-[#c9a962]"
                      }`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Referrals
                      <span className={`absolute bottom-[-4px] left-0 h-[1px] bg-[#c9a962] transition-all duration-300 ${
                        pathname.includes("/referrals") ? "w-full" : "w-0 group-hover:w-full"
                      }`}></span>
                    </Link>
                  </>
                )}
                <Link
                  href={dashboardLink}
                  onClick={(e) => {
                    // If already on the dashboard route, force a full page reload to reset state
                    if (pathname === dashboardLink || pathname.startsWith(dashboardLink)) {
                      e.preventDefault();
                      window.location.href = dashboardLink;
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-outfit font-medium tracking-wide transition-all duration-300 bg-[#c9a962] text-[#1a1d27] border-none hover:bg-[#dfc07a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(201,169,98,0.3)] h-[46px] px-9 text-[14px] rounded-[5px]"
                >
                  Dashboard
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  disabled={signingOut}
                  loading={signingOut}
                  className="text-[#b0b2bc] hover:text-[#f8f8fa]"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  {signingOut ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className={`text-[0.85rem] tracking-[0.02em] transition-colors duration-300 relative group ${
                  pathname === "/auth/login"
                    ? "text-[#c9a962]"
                    : "text-[#b0b2bc] hover:text-[#c9a962]"
                }`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Login
                <span className={`absolute bottom-[-4px] left-0 h-[1px] bg-[#c9a962] transition-all duration-300 ${
                  pathname === "/auth/login" ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 text-[#b0b2bc] hover:text-[#c9a962] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#21242f] border-t border-white/[0.08] py-3 space-y-3">
            {isLoggedIn ? (
              <>
                {canAccessMemberFeatures && (
                  <>
                    <Link
                      href="/directory"
                      className="block px-1 py-2 text-[0.85rem] tracking-[0.02em] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Directory
                    </Link>
                    <Link
                      href={referralsLink}
                      className="block px-1 py-2 text-[0.85rem] tracking-[0.02em] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Referrals
                    </Link>
                  </>
                )}
                <Link
                  href={dashboardLink}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    // If already on the dashboard route, force a full page reload to reset state
                    if (pathname === dashboardLink || pathname.startsWith(dashboardLink)) {
                      e.preventDefault();
                      window.location.href = dashboardLink;
                    }
                  }}
                  className="block w-full text-center inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-outfit font-medium tracking-wide transition-all duration-300 bg-[#c9a962] text-[#1a1d27] border-none hover:bg-[#dfc07a] h-10 px-9 text-[14px] rounded-[5px]"
                >
                  Dashboard
                </Link>
                <Button
                  variant="outline"
                  className="w-full h-10"
                  onClick={signOut}
                  disabled={signingOut}
                  loading={signingOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {signingOut ? "Logging out..." : "Logout"}
                </Button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block px-1 py-2 text-[0.85rem] tracking-[0.02em] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
