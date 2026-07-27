import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("cue-focus flex h-10 w-full rounded-xl border border-white/[.09] bg-white/[.035] px-3.5 text-sm text-white placeholder:text-[var(--color-foreground-subtle)] disabled:opacity-50 aria-[invalid=true]:border-[var(--color-danger)] aria-[invalid=true]:focus-visible:ring-[rgba(255,127,135,.35)]", className)} {...props} />
));
Input.displayName = "Input";
