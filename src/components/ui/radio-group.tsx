"use client";
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@/lib/utils";

export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(
  ({ className, ...props }, ref) => <RadioGroupPrimitive.Root ref={ref} className={cn("grid gap-2", className)} {...props} />,
);
RadioGroup.displayName = "RadioGroup";

export const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "cue-focus grid size-5 shrink-0 place-items-center rounded-full border border-[var(--color-border-strong)] bg-white/[.03] data-[state=checked]:border-[var(--color-primary-hover)] disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2.5 rounded-full bg-[var(--color-primary-hover)]" />
    </RadioGroupPrimitive.Item>
  ),
);
RadioGroupItem.displayName = "RadioGroupItem";
