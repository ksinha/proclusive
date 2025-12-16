import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex w-full rounded-md border px-[18px] py-[14px] text-[16px] bg-[#21242f] border-[rgba(255,255,255,0.08)] text-[#f8f8fa] font-['Outfit',sans-serif] transition-all duration-300 focus-visible:outline-none focus-visible:border-[#c9a962] focus-visible:shadow-[0_0_0_3px_rgba(201,169,98,0.15)] disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer",
          error && "border-red-500 focus-visible:border-red-500 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
