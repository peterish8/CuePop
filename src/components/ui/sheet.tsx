"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

const sheetVariants = cva("fixed z-[90] flex flex-col border-white/[.065] bg-[var(--color-surface-muted)] p-5", {
  variants: {
    side: {
      right: "inset-y-0 right-0 h-full w-full max-w-sm border-l",
      left: "inset-y-0 left-0 h-full w-full max-w-sm border-r",
      bottom: "inset-x-0 bottom-0 max-h-[85svh] border-t",
      top: "inset-x-0 top-0 max-h-[85svh] border-b",
    },
  },
  defaultVariants: { side: "right" },
});

export interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, VariantProps<typeof sheetVariants> {}

export const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ className, side, children, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-[90] bg-[var(--color-overlay)] backdrop-blur-sm" />
      <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
        {children}
        <DialogPrimitive.Close className="cue-focus absolute right-4 top-4 rounded-full text-[var(--color-foreground-subtle)] hover:text-white" aria-label="Close panel">
          <X className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
);
SheetContent.displayName = "SheetContent";

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 flex items-center justify-between", className)} {...props} />;
}

export const SheetTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn("font-semibold", className)} {...props} />,
);
SheetTitle.displayName = "SheetTitle";
