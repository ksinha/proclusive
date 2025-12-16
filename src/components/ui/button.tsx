import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-outfit font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a962] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#c9a962] text-[#1a1d27] border-none hover:bg-[#dfc07a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(201,169,98,0.3)]",
        cta:
          "bg-[#c9a962] text-[#1a1d27] border-none hover:bg-[#dfc07a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(201,169,98,0.3)]",
        outline:
          "bg-transparent text-[#c9a962] border border-[#c9a962] hover:bg-[rgba(201,169,98,0.15)]",
        ghost:
          "bg-transparent text-[#b0b2bc] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f8f8fa]",
        destructive:
          "bg-[#f87171] text-[#1a1d27] border-none hover:bg-[#ef4444]",
        secondary:
          "bg-[#282c38] text-[#b0b2bc] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(201,169,98,0.25)] hover:text-[#f8f8fa]",
        link:
          "text-[#c9a962] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-[42px] px-7 text-[13px] rounded-[4px]",
        default: "h-[46px] px-9 text-[14px] rounded-[5px]",
        lg: "h-[52px] px-12 text-[15px] rounded-[6px]",
        icon: "h-10 w-10 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const content = (
      <>
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </>
    )

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
