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
      <section className="bg-navy-800">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Headline Section */}
            <div className="space-y-6">
              <h1 className="text-[72px] font-bold text-white tracking-tight leading-tight">
                Proclusive
              </h1>
              <p className="text-[32px] font-semibold text-gray-200">
                High-Trust B2B Referral Network
              </p>
              <p className="text-[18px] text-gray-400">
                Vetting-as-a-Service for the Construction Industry
              </p>
            </div>

            {/* CTA Card */}
            <Card className="bg-white p-8 rounded-xl shadow-lg">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <Badge variant="enterprise" size="lg">
                    Founding 50 Exclusive
                  </Badge>
                </div>
                <div className="text-center space-y-3">
                  <h2 className="text-[24px] font-semibold text-gray-900">
                    Join the Founding 50
                  </h2>
                  <p className="text-[14px] text-gray-600">
                    Be part of the exclusive founding member network. Complete our comprehensive vetting
                    process and start exchanging high-quality B2B referrals.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button asChild variant="cta" className="w-full h-12">
                    <Link href="/auth/signup" className="gap-2">
                      Apply to Join
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

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-[48px] font-bold text-gray-900 font-tabular-nums">15</div>
              <p className="text-[14px] text-gray-600 font-medium">VaaS Verification Points</p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-[48px] font-bold text-gray-900 font-tabular-nums">70-80%</div>
              <p className="text-[14px] text-gray-600 font-medium">Referral Conversion Rate</p>
            </div>

            <div className="text-center space-y-3">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-[48px] font-bold text-gray-900 font-tabular-nums">100%</div>
              <p className="text-[14px] text-gray-600 font-medium">Pre-Vetted Professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-[36px] font-semibold text-gray-900">Why Join Proclusive?</h2>
            <p className="text-[14px] text-gray-600">
              The most rigorous vetting process in the construction industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Industry Experts Only</CardTitle>
                <CardDescription>
                  Connect with verified construction professionals who have passed our comprehensive 15-point verification process.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>High-Quality Referrals</CardTitle>
                <CardDescription>
                  Exchange B2B referrals with a 70-80% conversion rate, backed by our vetting-as-a-service platform.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Founding Member Benefits</CardTitle>
                <CardDescription>
                  Join the exclusive Founding 50 and shape the future of professional networking in construction.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Badge variant="outline" className="text-[12px]">
            Phase 1: Base Launch (VaaS Engine) • Target: April 16, 2026
          </Badge>
        </div>
      </section>
    </main>
  );
}
