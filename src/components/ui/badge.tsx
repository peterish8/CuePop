import { cn } from "@/lib/utils";
export function Badge({ className, children }: { className?: string; children: React.ReactNode }) { return <span className={cn("inline-flex items-center rounded-full border border-white/[.08] bg-white/[.045] px-2.5 py-1 text-[11px] font-semibold text-[#aeb6bf]", className)}>{children}</span>; }
