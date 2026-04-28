import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — every button shares these tokens
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-sans font-medium",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soil-400 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "transition-colors duration-150",
    "active:scale-[0.98] active:transition-transform active:duration-100",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // PRIMARY — soil-600, the main CTA
        default: [
          "bg-soil-600 text-white shadow-sm",
          "hover:bg-soil-500",
          "active:bg-soil-700",
        ].join(" "),

        // SECONDARY — warm brown surface
        secondary: [
          "bg-brown-100 text-brown-700 border border-brown-200",
          "hover:bg-brown-200",
          "active:bg-brown-300",
        ].join(" "),

        // DANGER — brick-500
        danger: [
          "bg-brick-500 text-white shadow-sm",
          "hover:bg-brick-600",
          "active:bg-brick-700",
        ].join(" "),

        // GHOST — transparent, brown text
        ghost: [
          "bg-transparent text-brown-600",
          "hover:bg-brown-50",
        ].join(" "),

        // OUTLINE — soil-600 border, transparent fill
        outline: [
          "bg-transparent text-soil-600 border border-soil-300",
          "hover:bg-soil-50",
        ].join(" "),

        // DESTRUCTIVE alias (shadcn/ui compat — maps to danger)
        destructive: [
          "bg-brick-500 text-white shadow-sm",
          "hover:bg-brick-600",
          "active:bg-brick-700",
        ].join(" "),

        // LINK
        link: "text-soil-600 underline-offset-4 hover:underline bg-transparent",
      },

      size: {
        sm:      "h-9 px-3 text-xs rounded-lg [&_svg]:size-3.5",
        default: "h-11 px-5 text-sm rounded-xl [&_svg]:size-4",
        lg:      "h-12 px-6 text-base rounded-xl [&_svg]:size-4",
        xl:      "h-14 px-8 text-lg rounded-2xl [&_svg]:size-5",
        icon:    "h-11 w-11 rounded-xl [&_svg]:size-4",
        "icon-sm": "h-9 w-9 rounded-lg [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, disabled, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
