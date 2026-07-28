import { cn } from "@/lib/utils";
export function CuePopLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return <div className={cn("inline-flex items-center gap-2.5", className)}>
    <img src="/brand/cuepop-mark.png" alt="" aria-hidden="true" className="size-8 object-contain" />
    {!compact && <span className="cue-logo-text text-[17px] font-bold tracking-[-.04em]">CuePop</span>}
  </div>;
}
