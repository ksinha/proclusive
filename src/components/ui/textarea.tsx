import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border px-3 py-2 text-[14px] text-gray-900 bg-white shadow-inner placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400",
          error
            ? "border-red-500 focus-visible:ring-red-500"
            : "border-gray-300 focus-visible:ring-blue-500",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
