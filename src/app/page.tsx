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
    <main className="min-h-screen relative">
      {/* Animated Background Atmosphere */}
      <div className="bg-atmosphere">
        <div className="bg-gradient"></div>
      </div>

      {/* Blueprint-style Grid Overlay - Fixed across entire viewport */}
      <div
        className="fixed top-0 left-0 w-full h-full z-[1] pointer-events-none max-md:opacity-50"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 169, 98, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.045) 1px, transparent 1px),
            linear-gradient(rgba(201, 169, 98, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: 'center center',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)'
        }}
      ></div>

      {/* Decorative Corner Accents - matching reference design */}
      {/* Top-left corner */}
      <div
        className="fixed top-[30px] left-[30px] w-[100px] h-[100px] pointer-events-none z-[5] border-l border-t border-[#c9a962]/25"
      ></div>
      {/* Bottom-right corner - positioned above footer */}
      <div
        className="fixed bottom-[200px] right-[30px] w-[100px] h-[100px] pointer-events-none z-[5] border-r border-b border-[#c9a962]/25"
      ></div>

      {/* Hero Section */}
      <section className="relative overflow-hidden z-10">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1f2230]/50 via-transparent to-[#1a1d27] pointer-events-none"></div>

        {/* Noise texture overlay */}
        <div
          className="fixed top-0 left-0 w-full h-full pointer-events-none"
          style={{
            zIndex: 2,
            opacity: 0.025,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")"
          }}
        ></div>

        {/* Decorative top gold line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/30 to-transparent"></div>

        <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 relative z-10">
          <div className="text-center space-y-8">
            {/* Eyebrow */}
            <p className="text-[12px] text-[#6a6d78] font-light uppercase tracking-[0.3em]">
              By invitation only
            </p>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-[42px] md:text-[52px] font-display font-light text-[#f8f8fa] leading-tight tracking-[0.02em]">
                Where trust builds
              </h1>
              <p className="text-[42px] md:text-[52px] font-display font-normal italic text-[#c9a962] leading-tight tracking-[0.02em]">
                infrastructure
              </p>
            </div>

            {/* Subheadline */}
            <p className="text-[16px] md:text-[18px] text-[#8a8d98] font-body font-light leading-relaxed max-w-2xl mx-auto">
              An exclusive network for the built environment. Fifty founding seats.
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
            <p className="text-[12px] text-[#6a6d78] font-light tracking-wide">
              DC Metro professionals
            </p>
          </div>

          {/* Stats Row */}
          <div className="mt-20 pt-12 border-t border-white/[0.06]">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-[32px] md:text-[40px] font-display font-light text-[#c9a962] tracking-tight">
                  15
                </div>
                <p className="text-[10px] md:text-[11px] text-[#6a6d78] font-light uppercase tracking-[0.15em] mt-1">
                  Point Verification
                </p>
              </div>
              <div className="text-center">
                <div className="text-[32px] md:text-[40px] font-display font-light text-[#c9a962] tracking-tight">
                  50
                </div>
                <p className="text-[10px] md:text-[11px] text-[#6a6d78] font-light uppercase tracking-[0.15em] mt-1">
                  Founding Seats
                </p>
              </div>
              <div className="text-center">
                <div className="text-[32px] md:text-[40px] font-display font-light text-[#c9a962] tracking-tight">
                  78%
                </div>
                <p className="text-[10px] md:text-[11px] text-[#6a6d78] font-light uppercase tracking-[0.15em] mt-1">
                  Referral Conversion
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 15-Point Verification Section - Distinct panel with darker background */}
      <section className="py-16 md:py-20 relative z-10">
        {/* Top border accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/20 to-transparent"></div>

        <div className="max-w-4xl mx-auto px-6">
          {/* Card container for visual distinction */}
          <div className="bg-[#252833]/60 border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
            {/* Subtle corner accents */}
            <div className="absolute top-4 left-4 w-8 h-8 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#c9a962]/30 to-transparent"></div>
              <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-[#c9a962]/30 to-transparent"></div>
            </div>
            <div className="absolute bottom-4 right-4 w-8 h-8 pointer-events-none">
              <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-[#c9a962]/30 to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-[1px] h-full bg-gradient-to-t from-[#c9a962]/30 to-transparent"></div>
            </div>

            {/* Centered content */}
            <div className="text-center space-y-6 md:space-y-8">
              {/* Icon with ring */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-[#c9a962]/20 flex items-center justify-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-[#c9a962]/10 rounded-full flex items-center justify-center">
                      <Shield className="h-7 w-7 md:h-8 md:w-8 text-[#c9a962]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="space-y-3">
                <p className="text-[11px] text-[#c9a962] font-light uppercase tracking-[0.2em]">
                  Vetting-as-a-Service™
                </p>
                <h2 className="text-[28px] md:text-[36px] lg:text-[40px] font-display font-light text-[#f8f8fa] leading-tight">
                  15-Point Verification
                </h2>
              </div>

              <p className="text-[15px] md:text-[16px] text-[#b0b2bc] font-body font-light leading-relaxed max-w-2xl mx-auto">
                Pass our comprehensive Vetting-as-a-Service™ (VaaS) verification. We validate your expertise, credentials, insurance, and professional track record to maintain network quality.
              </p>

              {/* Decorative divider */}
              <div className="pt-2">
                <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#c9a962]/40 to-transparent mx-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom border accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/20 to-transparent"></div>
      </section>

      {/* Features Section - Hidden for now, may re-enable later
      <section className="bg-[#21242f] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-[36px] font-display font-light text-[#f8f8fa]">Why Join Proclusive?</h2>
            <p className="text-[14px] text-[#b0b2bc] font-body font-light">
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
      */}

    </main>
  );
}
