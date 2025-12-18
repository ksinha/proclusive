import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Shield,
  DollarSign
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#1a1d27] relative overflow-hidden">
        {/* Grid background effect */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to bottom, transparent 0%, transparent 99%, rgba(201, 169, 98, 0.06) 100%)',
            backgroundSize: '100% 80px'
          }}></div>
          {/* Vertical grid lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, transparent 0%, transparent 99%, rgba(201, 169, 98, 0.06) 100%)',
            backgroundSize: '80px 100%'
          }}></div>
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f2230]/50 via-transparent to-[#1a1d27] pointer-events-none"></div>

        {/* Decorative corner lines - Top Left */}
        <div className="absolute top-8 left-8 pointer-events-none">
          <div className="w-24 h-[1px] bg-gradient-to-r from-[#c9a962]/40 to-transparent"></div>
          <div className="w-[1px] h-24 bg-gradient-to-b from-[#c9a962]/40 to-transparent"></div>
        </div>

        {/* Decorative corner lines - Bottom Right */}
        <div className="absolute bottom-8 right-8 pointer-events-none">
          <div className="w-24 h-[1px] bg-gradient-to-l from-[#c9a962]/40 to-transparent absolute bottom-0 right-0"></div>
          <div className="w-[1px] h-24 bg-gradient-to-t from-[#c9a962]/40 to-transparent absolute bottom-0 right-0"></div>
        </div>

        {/* Decorative top gold line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/30 to-transparent"></div>

        <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 relative z-10">
          <div className="text-center space-y-8">
            {/* Eyebrow */}
            <p className="text-[12px] text-[#6a6d78] font-medium uppercase tracking-[0.25em]">
              By invitation only
            </p>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-[42px] md:text-[52px] font-display font-normal text-[#f8f8fa] leading-tight">
                Where trust builds
              </h1>
              <p className="text-[42px] md:text-[52px] font-display italic text-[#c9a962] leading-tight">
                infrastructure
              </p>
            </div>

            {/* Subheadline */}
            <p className="text-[16px] md:text-[18px] text-[#8a8d98] font-body leading-relaxed max-w-2xl mx-auto">
              An exclusive network for the built environment. Verified professionals.
              <br className="hidden md:block" />
              Curated referrals. Fifty founding seats.
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Button asChild className="bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27] font-semibold px-8 py-3 text-[14px] rounded-md transition-all duration-300 hover:shadow-[0_0_30px_rgba(201,169,98,0.3)]">
                <Link href="/auth/signup">
                  Request an Invitation
                </Link>
              </Button>
            </div>

            {/* Small note */}
            <p className="text-[12px] text-[#6a6d78] tracking-wide">
              Limited to 50 founding members · DC Metro professionals
            </p>
          </div>

          {/* Stats Row */}
          <div className="mt-20 pt-12 border-t border-white/[0.06]">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-[32px] md:text-[40px] font-display font-light text-[#c9a962] tracking-tight">
                  15
                </div>
                <p className="text-[10px] md:text-[11px] text-[#6a6d78] font-medium uppercase tracking-[0.15em] mt-1">
                  Point Verification
                </p>
              </div>
              <div className="text-center">
                <div className="text-[32px] md:text-[40px] font-display font-light text-[#c9a962] tracking-tight">
                  50
                </div>
                <p className="text-[10px] md:text-[11px] text-[#6a6d78] font-medium uppercase tracking-[0.15em] mt-1">
                  Founding Seats
                </p>
              </div>
              <div className="text-center">
                <div className="text-[32px] md:text-[40px] font-display font-light text-[#c9a962] tracking-tight">
                  78%
                </div>
                <p className="text-[10px] md:text-[11px] text-[#6a6d78] font-medium uppercase tracking-[0.15em] mt-1">
                  Referral Conversion
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15-Point Verification Section */}
      <section className="bg-[#21242f] py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Mobile: Centered layout */}
          <div className="md:hidden text-center space-y-6">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8 text-gold" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] text-[#c9a962] font-medium uppercase tracking-[0.2em]">
                Vetting-as-a-Service™
              </p>
              <h2 className="text-[32px] font-display font-semibold text-[#f8f8fa]">
                15-Point Verification
              </h2>
            </div>
            <p className="text-[15px] text-[#b0b2bc] font-body leading-relaxed">
              Pass our comprehensive Vetting-as-a-Service™ (VaaS) verification. We validate your expertise, credentials, insurance, and professional track record to maintain network quality.
            </p>
          </div>

          {/* Desktop: Left icon, right text */}
          <div className="hidden md:flex items-center gap-12 lg:gap-16">
            {/* Left: Icon with decorative elements */}
            <div className="flex-shrink-0 relative">
              {/* Outer ring */}
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border border-[#c9a962]/20 flex items-center justify-center">
                {/* Inner circle with icon */}
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gold/10 rounded-full flex items-center justify-center">
                  <Shield className="h-10 w-10 lg:h-12 lg:w-12 text-gold" />
                </div>
              </div>
              {/* Decorative corner accent */}
              <div className="absolute -top-2 -left-2 w-6 h-6">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#c9a962]/50 to-transparent"></div>
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[#c9a962]/50 to-transparent"></div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-6 h-6">
                <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#c9a962]/50 to-transparent"></div>
                <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-[#c9a962]/50 to-transparent"></div>
              </div>
            </div>

            {/* Right: Text content */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-[11px] text-[#c9a962] font-medium uppercase tracking-[0.2em]">
                  Vetting-as-a-Service™
                </p>
                <h2 className="text-[36px] lg:text-[42px] font-display font-semibold text-[#f8f8fa] leading-tight">
                  15-Point Verification
                </h2>
              </div>
              <p className="text-[16px] lg:text-[17px] text-[#b0b2bc] font-body leading-relaxed max-w-xl">
                Pass our comprehensive Vetting-as-a-Service™ (VaaS) verification. We validate your expertise, credentials, insurance, and professional track record to maintain network quality.
              </p>
              {/* Decorative underline */}
              <div className="pt-2">
                <div className="w-16 h-[2px] bg-gradient-to-r from-[#c9a962] to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#21242f] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-[36px] font-display font-semibold text-[#f8f8fa]">Why Join Proclusive?</h2>
            <p className="text-[14px] text-[#b0b2bc] font-body">
              Unlock higher-converting opportunities with verified professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Close More Deals</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Referral-based leads convert at 70–80%—compared to 10–20% for cold outreach. Work with pre-qualified opportunities that are ready to close.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Earn Commissions</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Get rewarded when you connect fellow members with quality projects. Every successful referral earns you a commission.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Pre-Vetted Professionals</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  We verify credentials, insurance, and track record before anyone joins. You get introductions, not question marks.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

    </main>
  );
}
