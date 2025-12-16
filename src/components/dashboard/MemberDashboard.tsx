"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Profile, Application, ApplicationStatus } from "@/types/database.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VaasBadgeIcon, VaasBadgeCard } from "@/components/ui/vaas-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, GitBranch, Award, Clock, CheckCircle2, XCircle, AlertCircle, Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface MemberDashboardProps {
  profile: Profile | null;
  application: Application | null;
  userId: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { variant: "warning" | "default" | "success" | "destructive"; icon: any; message: string }
> = {
  pending: {
    variant: "warning",
    icon: Clock,
    message: "Your application is pending review by our admin team.",
  },
  under_review: {
    variant: "default",
    icon: AlertCircle,
    message: "Your application is currently under review.",
  },
  approved: {
    variant: "success",
    icon: CheckCircle2,
    message: "Congratulations! Your application has been approved.",
  },
  rejected: {
    variant: "destructive",
    icon: XCircle,
    message: "Your application was not approved. Please contact support for details.",
  },
};


interface EditFormData {
  full_name: string;
  phone: string;
  company_name: string;
  primary_trade: string;
  city: string;
  state: string;
  years_in_business: number | null;
  bio: string;
  website: string;
  is_public: boolean;
}

export default function MemberDashboard({
  profile,
  application,
  userId,
}: MemberDashboardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditFormData>({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    company_name: profile?.company_name || "",
    primary_trade: profile?.primary_trade || "",
    city: profile?.city || "",
    state: profile?.state || "",
    years_in_business: profile?.years_in_business || null,
    bio: profile?.bio || "",
    website: profile?.website || "",
    is_public: profile?.is_public ?? true,
  });

  const handleSave = async () => {
    console.log("[MemberDashboard] Starting profile save...");
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      console.log("[MemberDashboard] Updating profile for user:", userId);
      console.log("[MemberDashboard] Form data:", formData);

      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          company_name: formData.company_name,
          primary_trade: formData.primary_trade,
          city: formData.city || null,
          state: formData.state || null,
          years_in_business: formData.years_in_business,
          bio: formData.bio || null,
          website: formData.website || null,
          is_public: formData.is_public,
        })
        .eq("id", userId)
        .select();

      if (updateError) {
        console.error("[MemberDashboard] Update error:", updateError);
        throw updateError;
      }

      console.log("[MemberDashboard] Profile updated successfully:", data);
      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      console.error("[MemberDashboard] Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ background: '#1a1d27' }}>
        <Card className="text-center py-12" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
          <CardHeader>
            <CardTitle className="text-[24px]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>Complete Your Profile</CardTitle>
            <CardDescription className="text-[14px] mt-2" style={{ color: '#b0b2bc' }}>
              Get started by completing the vetting process to join the Proclusive network.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vetting">
              <Button size="lg" className="mt-4">
                Start Vetting Process
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = application ? STATUS_CONFIG[application.status] : null;

  return (
    <div className="min-h-screen" style={{ background: '#1a1d27' }}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div style={{ background: '#252833', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }} className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 mb-6 sm:mb-8 rounded-lg">
          <h1 className="text-xl sm:text-2xl lg:text-[28px]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>
            Welcome back, {profile.full_name.split(' ')[0]}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#b0b2bc' }}>{profile.company_name}</p>
        </div>

        {/* Verification Status Card */}
        {application && statusConfig && (
          <Card className="border-l-4 shadow-sm" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', borderLeft: '4px solid #60a5fa' }}>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left side - Status info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h2 className="text-base sm:text-lg" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>Verification Status</h2>
                      <Badge variant={statusConfig.variant}>
                        {application.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm" style={{ color: '#b0b2bc' }}>{statusConfig.message}</p>
                  </div>

                  {application.admin_notes && (
                    <div className="rounded-md p-3 sm:p-4" style={{ background: '#282c38', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <p className="text-xs sm:text-[13px] font-medium mb-1" style={{ color: '#f8f8fa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Notes:</p>
                      <p className="text-xs sm:text-[13px]" style={{ color: '#b0b2bc' }}>{application.admin_notes}</p>
                    </div>
                  )}
                </div>

                {/* Right side - Badge Card */}
                {application.status === "approved" && profile.badge_level !== "none" && (
                  <div className="flex-shrink-0">
                    <VaasBadgeCard level={profile.badge_level} highlighted />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg sm:text-xl mb-4" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Directory Card */}
            <Link href="/directory" className="group">
              <Card hover className="h-full" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '24px' }}>
                <CardContent className="pt-6">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 mb-3 sm:mb-4" style={{ color: '#60a5fa' }} />
                  <h3 className="text-sm sm:text-base mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>
                    Member Directory
                  </h3>
                  <p className="text-xs sm:text-[13px]" style={{ color: '#b0b2bc' }}>
                    Browse and connect with verified professionals
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Referrals Card */}
            <Link href="/dashboard/referrals" className="group">
              <Card hover className="h-full" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '24px' }}>
                <CardContent className="pt-6">
                  <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 mb-3 sm:mb-4" style={{ color: '#60a5fa' }} />
                  <h3 className="text-sm sm:text-base mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>
                    Referrals
                  </h3>
                  <p className="text-xs sm:text-[13px]" style={{ color: '#b0b2bc' }}>
                    Submit and manage B2B referrals
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Badge Progress Card (Coming Soon) */}
            <Card className="opacity-60" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '24px' }}>
              <CardContent className="pt-6">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 mb-3 sm:mb-4" style={{ color: '#60a5fa' }} />
                <h3 className="text-sm sm:text-base mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>
                  Advance Your Badge
                </h3>
                <p className="text-xs sm:text-[13px]" style={{ color: '#b0b2bc' }}>
                  Complete additional tiers to earn higher badges
                </p>
                <Badge variant="secondary" className="mt-3 text-xs" style={{ background: '#282c38', color: '#6a6d78' }}>Coming Soon</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Profile Summary */}
        <Card style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <CardTitle className="text-base sm:text-lg" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 400, color: '#f8f8fa' }}>Profile Summary</CardTitle>
                <CardDescription className="text-sm" style={{ color: '#b0b2bc' }}>Your membership information at a glance</CardDescription>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                {error && (
                  <div className="p-3 rounded-md" style={{ background: 'rgba(248, 113, 113, 0.1)', border: '1px solid #f87171' }}>
                    <p className="text-[13px]" style={{ color: '#f87171' }}>{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primary_trade">Primary Trade</Label>
                    <Input
                      id="primary_trade"
                      value={formData.primary_trade}
                      onChange={(e) => setFormData({ ...formData, primary_trade: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years_in_business">Years in Business</Label>
                    <Input
                      id="years_in_business"
                      type="number"
                      value={formData.years_in_business || ""}
                      onChange={(e) => setFormData({ ...formData, years_in_business: e.target.value ? parseInt(e.target.value) : null })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about your business..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="is_public" className="text-[14px] font-normal">
                    Make my profile visible in the member directory
                  </Label>
                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        full_name: profile.full_name,
                        phone: profile.phone || "",
                        company_name: profile.company_name,
                        primary_trade: profile.primary_trade,
                        city: profile.city || "",
                        state: profile.state || "",
                        years_in_business: profile.years_in_business,
                        bio: profile.bio || "",
                        website: profile.website || "",
                        is_public: profile.is_public,
                      });
                      setError(null);
                    }}
                    disabled={saving}
                    className="w-full sm:w-auto"
                    style={{ background: '#282c38', color: '#f8f8fa', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto" style={{ background: '#c9a962', color: '#1a1d27' }}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-[12px] font-medium uppercase tracking-wide" style={{ color: '#6a6d78', letterSpacing: '0.08em' }}>Email</p>
                  <p className="text-sm sm:text-[14px] font-medium break-words" style={{ color: '#f8f8fa' }}>{profile.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-[12px] font-medium uppercase tracking-wide" style={{ color: '#6a6d78', letterSpacing: '0.08em' }}>Phone</p>
                  <p className="text-sm sm:text-[14px] font-medium" style={{ color: '#f8f8fa' }}>{profile.phone || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-[12px] font-medium uppercase tracking-wide" style={{ color: '#6a6d78', letterSpacing: '0.08em' }}>Primary Trade</p>
                  <Badge variant="outline" className="text-xs">{profile.primary_trade}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-[12px] font-medium uppercase tracking-wide" style={{ color: '#6a6d78', letterSpacing: '0.08em' }}>Location</p>
                  <p className="text-sm sm:text-[14px] font-medium" style={{ color: '#f8f8fa' }}>
                    {profile.city}
                    {profile.city && profile.state && ", "}
                    {profile.state}
                    {!profile.city && !profile.state && "Not provided"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-[12px] font-medium uppercase tracking-wide" style={{ color: '#6a6d78', letterSpacing: '0.08em' }}>Years in Business</p>
                  <p className="text-sm sm:text-[14px] font-medium" style={{ color: '#f8f8fa' }}>{profile.years_in_business || "Not provided"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-[12px] font-medium uppercase tracking-wide" style={{ color: '#6a6d78', letterSpacing: '0.08em' }}>Profile Visibility</p>
                  <Badge variant={profile.is_public ? "success" : "secondary"} className="text-xs">
                    {profile.is_public ? "Public" : "Private"}
                  </Badge>
                </div>
                {profile.bio && (
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                    <p className="text-[10px] sm:text-[12px] font-medium uppercase tracking-wide" style={{ color: '#6a6d78', letterSpacing: '0.08em' }}>Bio</p>
                    <p className="text-sm sm:text-[14px]" style={{ color: '#b0b2bc' }}>{profile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
