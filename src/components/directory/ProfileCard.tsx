"use client";

import { Profile, BadgeLevel } from "@/types/database.types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight } from "lucide-react";

interface ProfileCardProps {
  profile: Profile;
  onClick: () => void;
}

const BADGE_LABELS: Record<BadgeLevel, string> = {
  none: "No Badge",
  compliance: "Compliance",
  capability: "Capability",
  reputation: "Reputation",
  enterprise: "Enterprise",
};

const BADGE_VARIANTS: Record<BadgeLevel, any> = {
  none: "secondary",
  compliance: "compliance",
  capability: "capability",
  reputation: "reputation",
  enterprise: "enterprise",
};

export default function ProfileCard({ profile, onClick }: ProfileCardProps) {
  const badgeLabel = BADGE_LABELS[profile.badge_level];
  const badgeVariant = BADGE_VARIANTS[profile.badge_level];

  return (
    <Card
      hover
      onClick={onClick}
      className="group overflow-hidden cursor-pointer hover:border-blue-300"
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-semibold text-gray-900 mb-1 truncate">
              {profile.full_name}
            </h3>
            <p className="text-[13px] text-gray-600 truncate">
              {profile.company_name}
            </p>
          </div>
          {profile.badge_level !== "none" && (
            <Badge variant={badgeVariant} className="ml-3 flex-shrink-0">
              {badgeLabel}
            </Badge>
          )}
        </div>

        {/* Trade Tag */}
        <div className="mb-4">
          <Badge variant="outline">
            {profile.primary_trade}
          </Badge>
        </div>

        {/* Location */}
        {(profile.city || profile.state) && (
          <div className="flex items-center text-[13px] text-gray-600 mb-4 gap-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {profile.city}
              {profile.city && profile.state && ", "}
              {profile.state}
            </span>
          </div>
        )}

        {/* Bio Preview */}
        {profile.bio && (
          <p className="text-[13px] text-gray-600 line-clamp-3 leading-relaxed">
            {profile.bio}
          </p>
        )}
      </CardContent>

      {/* View Profile CTA */}
      <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button className="text-[13px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group/button transition-colors">
          <span>View Profile</span>
          <ArrowRight className="h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
        </button>
      </CardFooter>
    </Card>
  );
}
