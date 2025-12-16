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
      className="group overflow-hidden cursor-pointer bg-[#252833] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(201,169,98,0.25)] hover:shadow-[0_0_30px_rgba(201,169,98,0.15)] hover:-translate-y-[3px] transition-all duration-[400ms] rounded-xl"
      style={{ padding: '24px' }}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-['Cormorant_Garamond',Georgia,serif] text-[#f8f8fa] mb-1 truncate" style={{ fontSize: '1.3rem', fontWeight: 500 }}>
              {profile.full_name}
            </h3>
            <p className="text-[#b0b2bc] truncate" style={{ fontSize: '0.95rem' }}>
              {profile.company_name}
            </p>
          </div>
          {profile.badge_level !== "none" && (
            <Badge variant={badgeVariant} className="ml-2 sm:ml-3 flex-shrink-0 text-xs">
              {badgeLabel}
            </Badge>
          )}
        </div>

        {/* Trade Tag */}
        <div className="mb-3 sm:mb-4">
          <Badge variant="outline" className="text-xs border-[rgba(255,255,255,0.08)] text-[#b0b2bc]">
            {profile.primary_trade}
          </Badge>
        </div>

        {/* Location */}
        {(profile.city || profile.state) && (
          <div className="flex items-center text-xs sm:text-[13px] text-[#b0b2bc] mb-3 sm:mb-4 gap-2">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">
              {profile.city}
              {profile.city && profile.state && ", "}
              {profile.state}
            </span>
          </div>
        )}

        {/* Bio Preview */}
        {profile.bio && (
          <p className="text-xs sm:text-[13px] text-[#b0b2bc] line-clamp-3 leading-relaxed">
            {profile.bio}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
