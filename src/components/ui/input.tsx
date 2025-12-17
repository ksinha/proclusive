import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full h-[52px] rounded-md border px-[18px] text-[16px] bg-[#21242f] border-[rgba(255,255,255,0.08)] text-[#f8f8fa] font-['Outfit',sans-serif] transition-all duration-300 file:border-0 file:bg-transparent file:text-[16px] file:font-medium placeholder:text-[#6a6d78] focus-visible:outline-none focus-visible:border-[#c9a962] focus-visible:shadow-[0_0_0_3px_rgba(201,169,98,0.15)] disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:border-red-500 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
