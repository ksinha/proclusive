"use client";

import { useEffect, useState } from "react";
import { Profile, PortfolioItem, BadgeLevel } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VaasBadgeIcon } from "@/components/ui/vaas-badge";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  Building2,
  Loader2
} from "lucide-react";

interface ProfileDetailModalProps {
  profile: Profile;
  badges: BadgeLevel[];
  onClose: () => void;
}

export default function ProfileDetailModal({
  profile,
  badges,
  onClose,
}: ProfileDetailModalProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch portfolio items
      const { data, error } = await supabase
        .from("portfolio_items")
        .select("*")
        .eq("profile_id", profile.id)
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Error fetching portfolio:", error);
        setLoading(false);
        return;
      }

      setPortfolioItems(data || []);

      // Fetch signed URLs for portfolio images
      if (data && data.length > 0) {
        const imageUrls: Record<string, string> = {};

        for (const item of data) {
          const { data: signedUrl } = await supabase.storage
            .from("portfolio")
            .createSignedUrl(item.image_url, 3600); // 1 hour expiry

          if (signedUrl) {
            imageUrls[item.id] = signedUrl.signedUrl;
          }
        }

        setPortfolioImages(imageUrls);
      }

      setLoading(false);
    }

    fetchData();
  }, [profile.id]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden bg-[#1a1d27] border border-[rgba(255,255,255,0.08)]">
        {/* Header */}
        <div className="sticky top-0 bg-[#252833] border-b border-[rgba(255,255,255,0.08)] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[20px] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[#f8f8fa]">Member Profile</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full hover:bg-[#282c38]"
          >
            <X className="h-5 w-5 text-[#b0b2bc]" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6 space-y-6 bg-[#1a1d27]">
          {/* Basic Info */}
          <Card className="bg-[#252833] border border-[rgba(255,255,255,0.08)] rounded-xl">
            <CardContent className="pt-6 p-8">
              <div className="flex items-start justify-between gap-6 mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[24px] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[#f8f8fa] mb-2">
                    {profile.full_name}
                  </h3>
                  <p className="text-[16px] text-[#b0b2bc] mb-3">
                    {profile.company_name}
                  </p>
                  <Badge variant="outline" className="border-[rgba(255,255,255,0.08)] text-[#b0b2bc]">
                    {profile.primary_trade}
                  </Badge>
                </div>
                {badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {badges.map((badge) => (
                      <VaasBadgeIcon
                        key={badge}
                        level={badge}
                        size="md"
                        showLabel
                        showSubtitle
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                {profile.phone && (
                  <div className="flex items-center gap-2 text-[#f8f8fa]">
                    <Phone className="h-4 w-4 text-[#b0b2bc] flex-shrink-0" />
                    <span className="text-[13px]">{profile.phone}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-2 text-[#f8f8fa]">
                    <Mail className="h-4 w-4 text-[#b0b2bc] flex-shrink-0" />
                    <span className="text-[13px] truncate">{profile.email}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              {(profile.city || profile.state) && (
                <div className="flex items-start gap-2 text-[#f8f8fa] mb-4">
                  <MapPin className="h-4 w-4 text-[#b0b2bc] flex-shrink-0 mt-0.5" />
                  <span className="text-[13px]">
                    {profile.street_address && `${profile.street_address}, `}
                    {profile.city}
                    {profile.city && profile.state && ", "}
                    {profile.state} {profile.zip_code}
                  </span>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-3">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#c9a962] hover:text-[#d4b674] transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card className="bg-[#252833] border border-[rgba(255,255,255,0.08)] rounded-xl">
            <CardContent className="pt-6 p-8">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-[#c9a962]" />
                <h4 className="text-[16px] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[#f8f8fa]">Business Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.business_type && (
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium text-[#b0b2bc] uppercase tracking-wide">Business Type</p>
                    <p className="text-[14px] font-medium text-[#f8f8fa]">{profile.business_type}</p>
                  </div>
                )}
                {profile.years_in_business !== null && (
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium text-[#b0b2bc] uppercase tracking-wide">Years in Business</p>
                    <p className="text-[14px] font-medium text-[#f8f8fa]">{profile.years_in_business}</p>
                  </div>
                )}
                {profile.team_size && (
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium text-[#b0b2bc] uppercase tracking-wide">Team Size</p>
                    <p className="text-[14px] font-medium text-[#f8f8fa]">{profile.team_size}</p>
                  </div>
                )}
                {profile.service_areas && profile.service_areas.length > 0 && (
                  <div className="col-span-2 space-y-2">
                    <p className="text-[12px] font-medium text-[#b0b2bc] uppercase tracking-wide">Service Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.service_areas.map((area, index) => (
                        <Badge key={index} variant="secondary" className="bg-[#282c38] text-[#b0b2bc] border-[rgba(255,255,255,0.08)]">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {profile.bio && (
            <Card className="bg-[#252833] border border-[rgba(255,255,255,0.08)] rounded-xl">
              <CardContent className="pt-6 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-5 w-5 text-[#c9a962]" />
                  <h4 className="text-[16px] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[#f8f8fa]">About</h4>
                </div>
                <p className="text-[14px] text-[#b0b2bc] leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          <Card className="bg-[#252833] border border-[rgba(255,255,255,0.08)] rounded-xl">
            <CardContent className="pt-6 p-8">
              <h4 className="text-[16px] font-['Cormorant_Garamond',Georgia,serif] font-semibold text-[#f8f8fa] mb-4">Portfolio</h4>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#c9a962]" />
                </div>
              ) : portfolioItems.length === 0 ? (
                <p className="text-[13px] text-[#b0b2bc] text-center py-8">
                  No portfolio items available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#282c38] rounded-lg overflow-hidden border-2 border-[rgba(255,255,255,0.08)] hover:border-[#c9a962] transition-all duration-200 hover:shadow-lg group"
                    >
                      {portfolioImages[item.id] && (
                        <div className="relative overflow-hidden">
                          <img
                            src={portfolioImages[item.id]}
                            alt={item.description || "Portfolio item"}
                            className="w-full h-64 object-cover"
                          />
                        </div>
                      )}
                      {item.description && (
                        <div className="p-4">
                          <p className="text-[13px] text-[#b0b2bc] leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </Card>
    </div>
  );
}
