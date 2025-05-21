import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold shadow-md ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-pink-400 to-pink-300 text-white hover:from-pink-500 hover:to-pink-400",
        destructive:
          "bg-gradient-to-r from-red-400 to-red-300 text-white hover:from-red-500 hover:to-red-400",
        outline:
          "border border-pink-200 bg-white/80 hover:bg-pink-50 text-pink-500",
        secondary:
          "bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700 hover:from-gray-300 hover:to-gray-200",
        ghost: "hover:bg-pink-50 text-pink-500",
        link: "text-pink-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2 text-base",
        sm: "h-10 rounded-full px-4 text-sm",
        lg: "h-14 rounded-full px-10 text-lg",
        icon: "h-12 w-12",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
