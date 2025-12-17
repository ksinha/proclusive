"use client";

import { useState, useMemo } from "react";
import { Profile, BadgeLevel } from "@/types/database.types";
import ProfileCard from "./ProfileCard";
import ProfileDetailModal from "./ProfileDetailModal";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface DirectoryClientProps {
  profiles: Profile[];
  currentUserId: string;
  userBadgesMap: Record<string, BadgeLevel[]>;
}

const TRADE_OPTIONS = [
  "All Trades",
  "Architecture",
  "Interior Design",
  "Project Management",
  "General Contracting",
  "Electrical",
  "Plumbing",
  "HVAC",
  "Landscaping",
  "Specialty Contractor",
  "Other",
];

const BADGE_FILTERS = [
  { value: "all", label: "All Badges" },
  { value: "verified", label: "Verified" },
  { value: "vetted", label: "Vetted" },
  { value: "elite", label: "Elite" },
];

export default function DirectoryClient({
  profiles,
  currentUserId,
  userBadgesMap,
}: DirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [tradeFilter, setTradeFilter] = useState("All Trades");
  const [locationFilter, setLocationFilter] = useState("");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile) => {
      // Search filter (name, company, trade, bio)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          profile.full_name.toLowerCase().includes(query) ||
          profile.company_name.toLowerCase().includes(query) ||
          profile.primary_trade.toLowerCase().includes(query) ||
          (profile.bio && profile.bio.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Trade filter
      if (tradeFilter !== "All Trades" && profile.primary_trade !== tradeFilter) {
        return false;
      }

      // Location filter
      if (locationFilter) {
        const locationQuery = locationFilter.toLowerCase();
        const matchesLocation =
          (profile.city && profile.city.toLowerCase().includes(locationQuery)) ||
          (profile.state && profile.state.toLowerCase().includes(locationQuery)) ||
          (profile.service_areas &&
            profile.service_areas.some((area) =>
              area.toLowerCase().includes(locationQuery)
            ));

        if (!matchesLocation) return false;
      }

      // Badge filter
      if (badgeFilter !== "all" && profile.badge_level !== badgeFilter) {
        return false;
      }

      return true;
    });
  }, [profiles, searchQuery, tradeFilter, locationFilter, badgeFilter]);

  return (
    <div className="min-h-screen" style={{ background: '#1a1d27' }}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 mb-6 sm:mb-8" style={{ background: '#21242f', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <h1 className="text-xl sm:text-2xl lg:text-[28px] font-semibold" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#f8f8fa' }}>
            Member Directory
          </h1>
          <p className="text-sm mt-1" style={{ color: '#b0b2bc' }}>
            Browse verified professionals in the Proclusive network
          </p>
        </div>

        {/* Filters */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 sm:py-6" style={{ background: '#21242f', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-xs sm:text-[12px] font-medium" style={{ color: '#b0b2bc' }}>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#b0b2bc' }} />
                <Input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="pl-9 h-10 sm:h-9 text-sm sm:text-[13px]"
                  style={{ background: '#282c38', color: '#f8f8fa', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                />
              </div>
            </div>

            {/* Trade Filter */}
            <div className="space-y-2">
              <Label htmlFor="trade" className="text-xs sm:text-[12px] font-medium" style={{ color: '#b0b2bc' }}>Trade</Label>
              <select
                id="trade"
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="flex h-10 sm:h-9 w-full rounded-md px-3 py-2 text-sm sm:text-[13px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: '#282c38', color: '#f8f8fa', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                {TRADE_OPTIONS.map((trade) => (
                  <option key={trade} value={trade} style={{ background: '#282c38', color: '#f8f8fa' }}>
                    {trade}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs sm:text-[12px] font-medium" style={{ color: '#b0b2bc' }}>Location</Label>
              <Input
                id="location"
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="City, State, or Area"
                className="h-10 sm:h-9 text-sm sm:text-[13px]"
                style={{ background: '#282c38', color: '#f8f8fa', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              />
            </div>

            {/* Badge Filter */}
            <div className="space-y-2">
              <Label htmlFor="badge" className="text-xs sm:text-[12px] font-medium" style={{ color: '#b0b2bc' }}>Verification Badge</Label>
              <select
                id="badge"
                value={badgeFilter}
                onChange={(e) => setBadgeFilter(e.target.value)}
                className="flex h-10 sm:h-9 w-full rounded-md px-3 py-2 text-sm sm:text-[13px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: '#282c38', color: '#f8f8fa', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                {BADGE_FILTERS.map((badge) => (
                  <option key={badge.value} value={badge.value} style={{ background: '#282c38', color: '#f8f8fa' }}>
                    {badge.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <p className="text-xs sm:text-[13px]" style={{ color: '#b0b2bc' }}>
              Showing <span className="font-medium" style={{ color: '#f8f8fa' }}>{filteredProfiles.length}</span> of {profiles.length} members
            </p>
            {(searchQuery || tradeFilter !== "All Trades" || locationFilter || badgeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setTradeFilter("All Trades");
                  setLocationFilter("");
                  setBadgeFilter("all");
                }}
                className="gap-1 w-full sm:w-auto"
                style={{ color: '#b0b2bc' }}
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {filteredProfiles.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center" style={{ background: '#252833', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <CardContent>
              <Search className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-4" style={{ color: '#b0b2bc' }} />
              <h3 className="text-sm sm:text-base font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: '#f8f8fa' }}>
                No members found
              </h3>
              <p className="text-xs sm:text-[13px]" style={{ color: '#b0b2bc' }}>
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                badges={userBadgesMap[profile.id] || (profile.badge_level !== "none" ? [profile.badge_level] : [])}
                onClick={() => setSelectedProfile(profile)}
              />
            ))}
          </div>
        )}

        {/* Profile Detail Modal */}
        {selectedProfile && (
          <ProfileDetailModal
            profile={selectedProfile}
            badges={userBadgesMap[selectedProfile.id] || (selectedProfile.badge_level !== "none" ? [selectedProfile.badge_level] : [])}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </div>
    </div>
  );
}
