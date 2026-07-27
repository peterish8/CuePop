import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("cue-focus min-h-24 w-full resize-y rounded-xl border border-white/[.09] bg-white/[.035] px-3.5 py-3 text-sm text-white placeholder:text-[#68717c] disabled:opacity-50", className)} {...props} />
));
Textarea.displayName = "Textarea";
