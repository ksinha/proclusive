"use client";

import { BadgeLevel } from "@/types/database.types";
import { Check, Star, Diamond } from "lucide-react";
import { cn } from "@/lib/utils";

interface VaasBadgeProps {
  level: BadgeLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showSubtitle?: boolean;
  highlighted?: boolean;
  className?: string;
}

const BADGE_CONFIG: Record<
  Exclude<BadgeLevel, "none" | "compliance" | "capability" | "reputation" | "enterprise">,
  {
    icon: typeof Check;
    label: string;
    subtitle: string;
    bgColor: string;
    textColor: string;
    glowColor: string;
    borderColor: string;
  }
> = {
  verified: {
    icon: Check,
    label: "Verified",
    subtitle: "IDENTITY CONFIRMED",
    bgColor: "bg-[#60a5fa]",
    textColor: "text-[#60a5fa]",
    glowColor: "shadow-[0_0_20px_rgba(96,165,250,0.4)]",
    borderColor: "border-[#60a5fa]/30",
  },
  vetted: {
    icon: Star,
    label: "Vetted",
    subtitle: "CAN DELIVER",
    bgColor: "bg-[#4ade80]",
    textColor: "text-[#4ade80]",
    glowColor: "shadow-[0_0_20px_rgba(74,222,128,0.4)]",
    borderColor: "border-[#4ade80]/30",
  },
  elite: {
    icon: Diamond,
    label: "Elite",
    subtitle: "ENTERPRISE READY",
    bgColor: "bg-[#c9a962]",
    textColor: "text-[#c9a962]",
    glowColor: "shadow-[0_0_20px_rgba(201,169,98,0.5)]",
    borderColor: "border-[#c9a962]/30",
  },
};

// Map legacy values to new values
const LEGACY_MAP: Record<string, "verified" | "vetted" | "elite"> = {
  compliance: "verified",
  capability: "vetted",
  reputation: "vetted",
  enterprise: "elite",
};

export function VaasBadgeIcon({
  level,
  size = "md",
  showLabel = false,
  showSubtitle = false,
  highlighted = false,
  className,
}: VaasBadgeProps) {
  // Handle none level
  if (level === "none") return null;

  // Map legacy values
  const mappedLevel = LEGACY_MAP[level] || level;

  // Make sure we have a valid level
  if (!BADGE_CONFIG[mappedLevel as keyof typeof BADGE_CONFIG]) return null;

  const config = BADGE_CONFIG[mappedLevel as keyof typeof BADGE_CONFIG];
  const Icon = config.icon;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "w-8 h-8",
      icon: "h-4 w-4",
      label: "text-[12px]",
      subtitle: "text-[9px]",
    },
    md: {
      container: "w-12 h-12",
      icon: "h-6 w-6",
      label: "text-[14px]",
      subtitle: "text-[10px]",
    },
    lg: {
      container: "w-20 h-20",
      icon: "h-10 w-10",
      label: "text-[18px]",
      subtitle: "text-[11px]",
    },
  };

  const sizes = sizeConfig[size];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Icon Circle */}
      <div
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          sizes.container,
          config.bgColor,
          highlighted && config.glowColor
        )}
      >
        <Icon
          className={cn(
            sizes.icon,
            level === "elite" ? "text-[#1a1d27]" : "text-white"
          )}
          strokeWidth={level === "elite" ? 2.5 : 2.5}
          fill={level === "elite" ? "#1a1d27" : "none"}
        />
      </div>

      {/* Label */}
      {showLabel && (
        <span
          className={cn(
            "font-['Cormorant_Garamond',Georgia,serif] font-semibold",
            sizes.label,
            config.textColor
          )}
        >
          {config.label}
        </span>
      )}

      {/* Subtitle */}
      {showSubtitle && (
        <span
          className={cn(
            "uppercase tracking-[0.1em] text-[#6a6d78] font-medium",
            sizes.subtitle
          )}
        >
          {config.subtitle}
        </span>
      )}
    </div>
  );
}

// Card version for display (like in the screenshot)
interface VaasBadgeCardProps {
  level: BadgeLevel;
  highlighted?: boolean;
  className?: string;
}

export function VaasBadgeCard({
  level,
  highlighted = false,
  className,
}: VaasBadgeCardProps) {
  if (level === "none") return null;

  const mappedLevel = LEGACY_MAP[level] || level;
  if (!BADGE_CONFIG[mappedLevel as keyof typeof BADGE_CONFIG]) return null;

  const config = BADGE_CONFIG[mappedLevel as keyof typeof BADGE_CONFIG];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 rounded-xl border bg-[#1a1d27] transition-all duration-300 w-[160px] h-[180px]",
        highlighted
          ? cn(config.borderColor, config.glowColor, "border-2")
          : "border-[rgba(255,255,255,0.08)]",
        className
      )}
    >
      <VaasBadgeIcon
        level={level}
        size="lg"
        showLabel
        showSubtitle
        highlighted={highlighted}
      />
    </div>
  );
}

// Inline badge with icon and text (for profile cards, etc.)
interface VaasBadgeInlineProps {
  level: BadgeLevel;
  size?: "sm" | "md";
  className?: string;
}

export function VaasBadgeInline({
  level,
  size = "sm",
  className,
}: VaasBadgeInlineProps) {
  if (level === "none") return null;

  const mappedLevel = LEGACY_MAP[level] || level;
  if (!BADGE_CONFIG[mappedLevel as keyof typeof BADGE_CONFIG]) return null;

  const config = BADGE_CONFIG[mappedLevel as keyof typeof BADGE_CONFIG];
  const Icon = config.icon;

  const sizeConfig = {
    sm: {
      container: "gap-1.5 px-2 py-1",
      icon: "w-4 h-4",
      iconContainer: "w-5 h-5",
      text: "text-[11px]",
    },
    md: {
      container: "gap-2 px-3 py-1.5",
      icon: "w-4 h-4",
      iconContainer: "w-6 h-6",
      text: "text-[12px]",
    },
  };

  const sizes = sizeConfig[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full",
        sizes.container,
        "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]",
        className
      )}
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center",
          sizes.iconContainer,
          config.bgColor
        )}
      >
        <Icon
          className={cn(
            sizes.icon,
            mappedLevel === "elite" ? "text-[#1a1d27]" : "text-white"
          )}
          strokeWidth={2.5}
          fill={mappedLevel === "elite" ? "#1a1d27" : "none"}
        />
      </div>
      <span
        className={cn(
          "font-medium uppercase tracking-[0.05em]",
          sizes.text,
          config.textColor
        )}
      >
        {config.label}
      </span>
    </div>
  );
}
