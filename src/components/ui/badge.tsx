import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[4px] font-medium transition-colors uppercase tracking-[0.08em] font-outfit",
  {
    variants: {
      variant: {
        // Status variants
        default:
          "bg-[rgba(96,165,250,0.15)] text-[#60a5fa] border border-[rgba(96,165,250,0.25)]",
        info:
          "bg-[rgba(96,165,250,0.15)] text-[#60a5fa] border border-[rgba(96,165,250,0.25)]",
        success:
          "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.25)]",
        warning:
          "bg-[rgba(251,191,36,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)]",
        destructive:
          "bg-[rgba(248,113,113,0.15)] text-[#f87171] border border-[rgba(248,113,113,0.25)]",
        secondary:
          "bg-[#282c38] text-[#b0b2bc] border-none",
        outline:
          "bg-transparent text-[#b0b2bc] border border-[rgba(255,255,255,0.08)]",
        // VaaS tier variants
        verified:
          "bg-[rgba(96,165,250,0.15)] text-[#60a5fa] border border-[rgba(96,165,250,0.25)]",
        vetted:
          "bg-[rgba(74,222,128,0.15)] text-[#4ade80] border border-[rgba(74,222,128,0.25)]",
        elite:
          "bg-[rgba(201,169,98,0.15)] text-[#c9a962] border border-[rgba(201,169,98,0.25)]",
      },
      size: {
        sm: "px-2.5 py-1 text-[0.65rem]",
        default: "px-[14px] py-[6px] text-[0.75rem]",
        lg: "px-4 py-2 text-[0.8rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
