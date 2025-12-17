"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, isVerified, signOut } = useAuth();

  const isLoggedIn = !!user;
  // Only show Directory and Referrals to verified/approved users or admins
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
                <Button asChild variant="cta">
                  <Link href={dashboardLink}>Dashboard</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
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
                <Button asChild variant="cta">
                  <Link href="/auth/signup">Apply to Join</Link>
                </Button>
              </>
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
                <Button asChild variant="cta" className="w-full h-10">
                  <Link href={dashboardLink} onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10"
                  onClick={() => {
                    signOut();
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
                  className="block px-1 py-2 text-[0.85rem] tracking-[0.02em] text-[#b0b2bc] hover:text-[#c9a962] transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Login
                </Link>
                <Button asChild variant="cta" className="w-full h-10">
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    Apply to Join
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
