import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("cue-focus min-h-24 w-full resize-y rounded-xl border border-white/[.09] bg-white/[.035] px-3.5 py-3 text-sm text-white placeholder:text-[var(--color-foreground-subtle)] disabled:opacity-50 aria-[invalid=true]:border-[var(--color-danger)] aria-[invalid=true]:focus-visible:ring-[rgba(255,127,135,.35)]", className)} {...props} />
));
Textarea.displayName = "Textarea";
