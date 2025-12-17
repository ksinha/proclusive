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
          "flex w-full rounded-md border px-3 py-2.5 text-[14px] bg-[#21242f] border-[rgba(255,255,255,0.08)] text-[#f8f8fa] font-['Outfit',sans-serif] transition-all duration-300 focus-visible:outline-none focus-visible:border-[#c9a962] focus-visible:shadow-[0_0_0_3px_rgba(201,169,98,0.15)] disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20width%3d%2224%22%20height%3d%2224%22%20viewBox%3d%220%200%2024%2024%22%20fill%3d%22none%22%20stroke%3d%22%23b0b2bc%22%20stroke-width%3d%222%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%3e%3cpolyline%20points%3d%226%209%2012%2015%2018%209%22%3e%3c%2fpolyline%3e%3c%2fsvg%3e')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10 [color-scheme:dark] [&>option]:bg-[#21242f] [&>option]:text-[#f8f8fa] [&>option]:py-2",
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
