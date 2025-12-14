"use client";

import { useEffect, useState } from "react";
import { Profile, PortfolioItem, BadgeLevel } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Briefcase,
  Users,
  Building2,
  Loader2
} from "lucide-react";

interface ProfileDetailModalProps {
  profile: Profile;
  onClose: () => void;
}

const BADGE_VARIANTS: Record<BadgeLevel, any> = {
  none: "secondary",
  compliance: "compliance",
  capability: "capability",
  reputation: "reputation",
  enterprise: "enterprise",
};

const BADGE_LABELS: Record<BadgeLevel, string> = {
  none: "No Badge",
  compliance: "Compliance Verified",
  capability: "Capability Verified",
  reputation: "Reputation Verified",
  enterprise: "Enterprise Verified",
};

export default function ProfileDetailModal({
  profile,
  onClose,
}: ProfileDetailModalProps) {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
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

    fetchPortfolio();
  }, [profile.id]);

  const badgeVariant = BADGE_VARIANTS[profile.badge_level];
  const badgeLabel = BADGE_LABELS[profile.badge_level];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[20px] font-semibold text-gray-900">Member Profile</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)] p-6 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  {profile.badge_level !== "none" && (
                    <Badge variant={badgeVariant} className="mb-3">
                      {badgeLabel}
                    </Badge>
                  )}
                  <h3 className="text-[24px] font-semibold text-gray-900 mb-2">
                    {profile.full_name}
                  </h3>
                  <p className="text-[16px] text-gray-600 mb-3">
                    {profile.company_name}
                  </p>
                  <Badge variant="outline">
                    {profile.primary_trade}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-200">
                {profile.phone && (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-[13px]">{profile.phone}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-[13px] truncate">{profile.email}</span>
                  </div>
                )}
              </div>

              {/* Location */}
              {(profile.city || profile.state) && (
                <div className="flex items-start gap-2 text-gray-900 mb-4">
                  <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
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
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h4 className="text-[16px] font-semibold text-gray-900">Business Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.business_type && (
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Business Type</p>
                    <p className="text-[14px] font-medium text-gray-900">{profile.business_type}</p>
                  </div>
                )}
                {profile.years_in_business !== null && (
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Years in Business</p>
                    <p className="text-[14px] font-medium text-gray-900">{profile.years_in_business}</p>
                  </div>
                )}
                {profile.team_size && (
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Team Size</p>
                    <p className="text-[14px] font-medium text-gray-900">{profile.team_size}</p>
                  </div>
                )}
                {profile.service_areas && profile.service_areas.length > 0 && (
                  <div className="col-span-2 space-y-2">
                    <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wide">Service Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.service_areas.map((area, index) => (
                        <Badge key={index} variant="secondary">
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  <h4 className="text-[16px] font-semibold text-gray-900">About</h4>
                </div>
                <p className="text-[14px] text-gray-900 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Portfolio */}
          <Card>
            <CardContent className="pt-6">
              <h4 className="text-[16px] font-semibold text-gray-900 mb-4">Portfolio</h4>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : portfolioItems.length === 0 ? (
                <p className="text-[13px] text-gray-600 text-center py-8">
                  No portfolio items available
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolioItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md group"
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
                          <p className="text-[13px] text-gray-900 leading-relaxed">
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

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <Button onClick={onClose} variant="secondary" size="lg">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
