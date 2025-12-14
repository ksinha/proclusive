"use client";

import { useState, useMemo } from "react";
import { Profile } from "@/types/database.types";
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
  { value: "compliance", label: "Compliance" },
  { value: "capability", label: "Capability" },
  { value: "reputation", label: "Reputation" },
  { value: "enterprise", label: "Enterprise" },
];

export default function DirectoryClient({
  profiles,
  currentUserId,
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
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 -mx-6 px-6 py-6 mb-8">
          <h1 className="text-[28px] font-semibold text-gray-900">
            Member Directory
          </h1>
          <p className="text-[14px] text-gray-600 mt-1">
            Browse verified professionals in the Proclusive network
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white border-b border-gray-200 -mx-6 px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search" className="text-[12px] font-medium text-gray-700">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="pl-9 h-9 text-[13px]"
                />
              </div>
            </div>

            {/* Trade Filter */}
            <div className="space-y-2">
              <Label htmlFor="trade" className="text-[12px] font-medium text-gray-700">Trade</Label>
              <select
                id="trade"
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {TRADE_OPTIONS.map((trade) => (
                  <option key={trade} value={trade}>
                    {trade}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-[12px] font-medium text-gray-700">Location</Label>
              <Input
                id="location"
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="City, State, or Area"
                className="h-9 text-[13px]"
              />
            </div>

            {/* Badge Filter */}
            <div className="space-y-2">
              <Label htmlFor="badge" className="text-[12px] font-medium text-gray-700">Verification Badge</Label>
              <select
                id="badge"
                value={badgeFilter}
                onChange={(e) => setBadgeFilter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-[13px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                {BADGE_FILTERS.map((badge) => (
                  <option key={badge.value} value={badge.value}>
                    {badge.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-[13px] text-gray-600">
              Showing <span className="font-medium text-gray-900">{filteredProfiles.length}</span> of {profiles.length} members
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
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {filteredProfiles.length === 0 ? (
          <Card className="p-12 text-center">
            <CardContent>
              <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">
                No members found
              </h3>
              <p className="text-[13px] text-gray-600">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                onClick={() => setSelectedProfile(profile)}
              />
            ))}
          </div>
        )}

        {/* Profile Detail Modal */}
        {selectedProfile && (
          <ProfileDetailModal
            profile={selectedProfile}
            onClose={() => setSelectedProfile(null)}
          />
        )}
      </div>
    </div>
  );
}
