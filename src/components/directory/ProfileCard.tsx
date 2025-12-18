"use client";

import { Profile, BadgeLevel } from "@/types/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VaasBadgeInline } from "@/components/ui/vaas-badge";
import { Avatar } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

interface ProfileCardProps {
  profile: Profile;
  badges: BadgeLevel[];
  profilePictureUrl?: string | null;
  onClick: () => void;
}

export default function ProfileCard({ profile, badges, profilePictureUrl, onClick }: ProfileCardProps) {

  return (
    <Card
      hover
      onClick={onClick}
      className="group overflow-hidden cursor-pointer bg-[#252833] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(201,169,98,0.25)] hover:shadow-[0_0_30px_rgba(201,169,98,0.15)] hover:-translate-y-[3px] transition-all duration-[400ms] rounded-xl"
      style={{ padding: '24px' }}
    >
      <CardContent className="p-0">
        {/* Header with Avatar */}
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
          <Avatar
            src={profilePictureUrl}
            alt={profile.full_name}
            fallbackInitials={profile.full_name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-['Cormorant_Garamond',Georgia,serif] text-[#f8f8fa] mb-1 truncate" style={{ fontSize: '1.3rem', fontWeight: 500 }}>
                  {profile.full_name}
                </h3>
                <p className="text-[#b0b2bc] truncate" style={{ fontSize: '0.95rem' }}>
                  {profile.company_name}
                </p>
              </div>
              {badges.length > 0 && (
                <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
                  {badges.map((badge) => (
                    <VaasBadgeInline key={badge} level={badge} size="sm" />
                  ))}
                </div>
              )}
            </div>
          </div>
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
