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
  const { user, isAdmin, loading, signOut } = useAuth();

  const isLoggedIn = !!user;

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
