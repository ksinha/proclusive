import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  TrendingUp,
  Shield,
  ArrowRight,
  Building2,
  Users,
  Award
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary relative overflow-hidden">
        {/* Atmospheric gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-primary pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Headline Section */}
            <div className="space-y-6">
              <h1 className="text-[72px] font-display font-light text-[#f8f8fa] tracking-[0.2em] leading-tight">
                Proclusive
              </h1>
              <p className="text-[14px] text-[#6a6d78] font-medium uppercase tracking-[0.15em]">
                By invitation only
              </p>
              <p className="text-[32px] font-display font-semibold text-[#f8f8fa]">
                Where trust builds <span className="italic text-gold">infrastructure</span>
              </p>
              <p className="text-[18px] text-[#b0b2bc] font-body">
                Vetting-as-a-Service for the Construction Industry
              </p>
            </div>

            {/* CTA Card */}
            <Card className="bg-[#252833] border border-white/[0.08] p-8 rounded-xl shadow-lg transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_30px_rgba(201,169,98,0.15)]">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Badge variant="elite" size="lg">
                    Founding 50 Exclusive
                  </Badge>
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-[24px] font-display font-semibold text-[#f8f8fa]">
                    Join the Founding 50
                  </h2>
                  <p className="text-[14px] text-[#b0b2bc] font-body">
                    Be part of the exclusive founding member network. Complete our comprehensive vetting
                    process and start exchanging high-quality B2B referrals.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button asChild variant="cta" className="w-full h-12">
                    <Link href="/auth/signup" className="gap-2">
                      Request an Invitation
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full h-12">
                    <Link href="/auth/login">
                      Member Login
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
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

      {/* Stats Section */}
      <section className="bg-primary py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-gold" />
                </div>
              </div>
              <div className="text-[48px] font-display font-bold text-gold font-tabular-nums">15</div>
              <p className="text-[14px] text-[#6a6d78] font-medium uppercase tracking-wide">VaaS Verification Points</p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-gold" />
                </div>
              </div>
              <div className="text-[48px] font-display font-bold text-gold font-tabular-nums">70-80%</div>
              <p className="text-[14px] text-[#6a6d78] font-medium uppercase tracking-wide">Referral Conversion Rate</p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-gold" />
                </div>
              </div>
              <div className="text-[48px] font-display font-bold text-gold font-tabular-nums">100%</div>
              <p className="text-[14px] text-[#6a6d78] font-medium uppercase tracking-wide">Pre-Vetted Professionals</p>
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
              The most rigorous vetting process in the construction industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Industry Experts Only</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Connect with verified construction professionals who have passed our comprehensive 15-point verification process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">High-Quality Referrals</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Exchange B2B referrals with a 70-80% conversion rate, backed by our vetting-as-a-service platform.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-[#252833] border-white/[0.08] transition-all duration-300 hover:border-gold/25 hover:shadow-[0_0_20px_rgba(201,169,98,0.1)]">
              <CardHeader>
                <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-gold" />
                </div>
                <CardTitle className="text-[#f8f8fa]">Founding Member Benefits</CardTitle>
                <CardDescription className="text-[#b0b2bc]">
                  Join the exclusive Founding 50 and shape the future of professional networking in construction.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

    </main>
  );
}
