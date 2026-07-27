import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "cue-btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[rgba(77,127,224,.55)]",
  {
    variants: {
      variant: {
        default: "bg-[#ededed] text-[#0a0a0a] hover:bg-white hover:shadow-[0_8px_28px_rgba(77,127,224,.28)]",
        accent: "bg-[var(--cyan)] text-[#061013] hover:bg-[var(--cyan-strong)] hover:shadow-[0_8px_28px_rgba(77,127,224,.38)]",
        secondary: "bg-white/[.04] text-white border border-white/[.08] hover:bg-white/[.07] hover:border-white/[.12] hover:shadow-[0_8px_24px_rgba(77,127,224,.12)] active:bg-white/[.09]",
        ghost: "text-[var(--muted)] hover:text-white hover:bg-white/[.05] active:bg-white/[.08]",
        danger: "bg-[rgba(255,127,135,.1)] text-[#ff9aa1] border border-[rgba(255,127,135,.16)] hover:bg-[rgba(255,127,135,.16)] active:bg-[rgba(255,127,135,.22)]",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-10 px-5",
        lg: "h-11 px-6 text-[15px]",
        icon: "size-10 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; }

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";
