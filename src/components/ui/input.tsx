import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("cue-focus flex h-11 w-full rounded-xl border border-white/[.09] bg-white/[.035] px-3.5 text-sm text-white placeholder:text-[#68717c] disabled:opacity-50", className)} {...props} />
));
Input.displayName = "Input";
