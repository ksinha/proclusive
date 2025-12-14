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
          "flex h-10 w-full rounded-md border px-3 py-2 text-[14px] text-gray-900 bg-white shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-gray-300 focus-visible:ring-blue-500",
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
