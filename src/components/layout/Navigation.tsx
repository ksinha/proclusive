"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const publicNav = [
  { label: "Home", href: "/" },
  { label: "Login", href: "/auth/login" },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[14px] font-medium transition-colors ${
                  pathname === item.href
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="cta">
              <Link href="/auth/signup">Apply to Join</Link>
            </Button>
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
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block text-[14px] font-medium transition-colors ${
                  pathname === item.href
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="cta" className="w-full">
              <Link href="/auth/signup">Apply to Join</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
