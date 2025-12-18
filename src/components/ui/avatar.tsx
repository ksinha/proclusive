"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { User, Move } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Avatar with upload and positioning functionality
interface AvatarUploadProps extends Omit<AvatarProps, "src"> {
  src?: string | null;
  onFileSelect: (file: File, position?: { x: number; y: number }) => void;
  previewUrl?: string | null;
  disabled?: boolean;
  enablePositioning?: boolean;
}

// Image positioning modal component
function ImagePositioner({
  imageUrl,
  onSave,
  onCancel,
}: {
  imageUrl: string;
  onSave: (position: { x: number; y: number }) => void;
  onCancel: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = ((e.clientX - startPos.x) / rect.width) * 100;
      const deltaY = ((e.clientY - startPos.y) / rect.height) * 100;

      setPosition((prev) => ({
        x: Math.max(0, Math.min(100, prev.x - deltaX)),
        y: Math.max(0, Math.min(100, prev.y - deltaY)),
      }));
      setStartPos({ x: e.clientX, y: e.clientY });
    },
    [isDragging, startPos]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#21242f] rounded-xl border border-[rgba(255,255,255,0.08)] p-6 max-w-md w-full">
        <h3 className="text-[18px] font-semibold text-[#f8f8fa] mb-2">
          Position Your Photo
        </h3>
        <p className="text-[13px] text-[#b0b2bc] mb-4">
          Drag the image to adjust how it appears in the circular frame.
        </p>

        <div
          ref={containerRef}
          className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-2 border-[#c9a962] cursor-move mb-6"
          onMouseDown={handleMouseDown}
        >
          <img
            src={imageUrl}
            alt="Position preview"
            className="absolute w-[200%] h-[200%] max-w-none object-cover select-none"
            style={{
              left: `${-position.x}%`,
              top: `${-position.y}%`,
            }}
            draggable={false}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-2">
              <Move className="h-5 w-5 text-white/80" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} className="h-9 text-[13px]">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(position)}
            className="h-9 text-[13px] bg-[#c9a962] hover:bg-[#d4b674] text-[#1a1d27]"
          >
            Save Position
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AvatarUpload({
  src,
  alt,
  size = "xl",
  fallbackInitials,
  onFileSelect,
  previewUrl,
  disabled = false,
  enablePositioning = true,
  className = "",
}: AvatarUploadProps) {
  const [imageError, setImageError] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showPositioner, setShowPositioner] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displaySrc = previewUrl || src;
  const showImage = displaySrc && !imageError;
  const initials = getInitials(fallbackInitials || alt);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input to allow selecting same file again
    if (e.target) {
      e.target.value = "";
    }
  };

  const processFile = (file: File) => {
    if (enablePositioning) {
      // Create preview and show positioner
      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingFile(file);
        setPendingPreview(reader.result as string);
        setShowPositioner(true);
      };
      reader.readAsDataURL(file);
    } else {
      onFileSelect(file);
      setImageError(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const handlePositionSave = (position: { x: number; y: number }) => {
    if (pendingFile) {
      setImagePosition(position);
      onFileSelect(pendingFile, position);
      setImageError(false);
    }
    setShowPositioner(false);
    setPendingFile(null);
    setPendingPreview(null);
  };

  const handlePositionCancel = () => {
    setShowPositioner(false);
    setPendingFile(null);
    setPendingPreview(null);
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div className={`relative inline-block ${className}`}>
        <div
          className={`block cursor-pointer ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={triggerFileInput}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={disabled ? undefined : handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              triggerFileInput();
            }
          }}
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
                className="absolute w-[200%] h-[200%] max-w-none object-cover"
                style={{
                  left: `${-imagePosition.x}%`,
                  top: `${-imagePosition.y}%`,
                }}
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
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
          disabled={disabled}
        />
      </div>

      {/* Image Positioner Modal */}
      {showPositioner && pendingPreview && (
        <ImagePositioner
          imageUrl={pendingPreview}
          onSave={handlePositionSave}
          onCancel={handlePositionCancel}
        />
      )}
    </>
  );
}
