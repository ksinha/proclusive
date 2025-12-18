"use client";

import { useState } from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  fallbackInitials?: string;
  className?: string;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-[13px]",
  lg: "h-12 w-12 text-[14px]",
  xl: "h-16 w-16 text-[18px]",
  "2xl": "h-24 w-24 text-[24px]",
};

const iconSizes = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-12 w-12",
};

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  src,
  alt,
  size = "md",
  fallbackInitials,
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(!!src);

  const showImage = src && !imageError;
  const initials = getInitials(fallbackInitials || alt);

  return (
    <div
      className={`relative flex-shrink-0 rounded-full overflow-hidden bg-[#282c38] border border-[rgba(255,255,255,0.08)] flex items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      {showImage ? (
        <>
          {imageLoading && (
            <div className="absolute inset-0 bg-[#282c38] animate-pulse" />
          )}
          <img
            src={src}
            alt={alt || "Profile picture"}
            className="h-full w-full object-cover"
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        </>
      ) : initials ? (
        <span className="font-semibold text-[#c9a962]">{initials}</span>
      ) : (
        <User className={`${iconSizes[size]} text-[#6a6d78]`} />
      )}
    </div>
  );
}

// Avatar with upload functionality
interface AvatarUploadProps extends Omit<AvatarProps, "src"> {
  src?: string | null;
  onFileSelect: (file: File) => void;
  previewUrl?: string | null;
  disabled?: boolean;
}

export function AvatarUpload({
  src,
  alt,
  size = "xl",
  fallbackInitials,
  onFileSelect,
  previewUrl,
  disabled = false,
  className = "",
}: AvatarUploadProps) {
  const [imageError, setImageError] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const displaySrc = previewUrl || src;
  const showImage = displaySrc && !imageError;
  const initials = getInitials(fallbackInitials || alt);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      setImageError(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFileSelect(file);
      setImageError(false);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <label
        className={`block cursor-pointer ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={disabled ? undefined : handleDrop}
      >
        <div
          className={`relative flex-shrink-0 rounded-full overflow-hidden bg-[#282c38] border-2 ${
            dragOver ? "border-[#c9a962]" : "border-[rgba(255,255,255,0.08)]"
          } flex items-center justify-center transition-all duration-200 hover:border-[#c9a962]/50 group ${sizeClasses[size]}`}
        >
          {showImage ? (
            <img
              src={displaySrc}
              alt={alt || "Profile picture"}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : initials ? (
            <span className="font-semibold text-[#c9a962]">{initials}</span>
          ) : (
            <User className={`${iconSizes[size]} text-[#6a6d78]`} />
          )}

          {/* Hover overlay */}
          {!disabled && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[11px] font-medium text-center px-2">
                {showImage ? "Change" : "Upload"}
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          disabled={disabled}
        />
      </label>
    </div>
  );
}
