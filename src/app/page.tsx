import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Shield,
  Building2,
  Users,
  Award
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

      {/* How It Works Section */}
      <section className="bg-[#21242f] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-[36px] font-display font-semibold text-[#f8f8fa]">How It Works</h2>
            <p className="text-[14px] text-[#b0b2bc] font-body">
              Join an exclusive network built on trust and verified expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="relative overflow-visible bg-[#252833] border-white/[0.08]">
              <CardHeader>
                <div className="absolute -top-4 -left-4">
                  <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-[20px] font-bold text-primary">1</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Get Invited</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Join through a trusted connection in the Founding 50. Our invite-only approach ensures every member is vouched for by existing professionals.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 2 */}
            <Card className="relative overflow-visible bg-[#252833] border-white/[0.08]">
              <CardHeader>
                <div className="absolute -top-4 -left-4">
                  <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-[20px] font-bold text-primary">2</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Complete Vetting</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Pass our comprehensive 15-point verification process. We validate your expertise, track record, and professional credentials to maintain network quality.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Step 3 */}
            <Card className="relative overflow-visible bg-[#252833] border-white/[0.08]">
              <CardHeader>
                <div className="absolute -top-4 -left-4">
                  <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-[20px] font-bold text-primary">3</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Connect & Grow</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Access our vetted directory, exchange high-converting referrals, and build strategic partnerships with verified construction professionals.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#21242f] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-[36px] font-display font-semibold text-[#f8f8fa]">Why Join Proclusive?</h2>
            <p className="text-[14px] text-[#b0b2bc] font-body">
              The most rigorous vetting process in the construction industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Build Trust Together</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Connect with verified industry experts. By joining our vetted network, you become part of a trusted community that elevates professional standards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Earn Commissions</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Get rewarded for your referrals. Earn commissions when you connect fellow members with quality business opportunities.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Expand Your Network</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Grow your business through strategic connections. Access our vetted directory of construction professionals and unlock new opportunities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

    </main>
  );
}
