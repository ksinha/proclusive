import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md font-semibold transition-colors",
  {
    variants: {
      variant: {
        // Status variants (subtle)
        default:
          "bg-blue-50 text-blue-700 border border-blue-200",
        success:
          "bg-green-50 text-green-700 border border-green-200",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-200",
        destructive:
          "bg-red-50 text-red-700 border border-red-200",
        secondary:
          "bg-gray-100 text-gray-700 border border-gray-200",
        outline:
          "bg-white text-gray-700 border border-gray-300",
        info:
          "bg-blue-100 text-blue-800 border border-blue-300",
        // VaaS variants (bold)
        compliance:
          "bg-blue-500 text-white shadow-sm",
        capability:
          "bg-green-500 text-white shadow-sm",
        reputation:
          "bg-purple-500 text-white shadow-sm",
        enterprise:
          "bg-orange-500 text-white shadow-sm",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        default: "px-2.5 py-0.5 text-[12px]",
        lg: "px-3 py-1 text-[13px] rounded-lg",
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
