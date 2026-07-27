import { cn } from "@/lib/utils";
export function CuePopLogo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return <div className={cn("inline-flex items-center gap-2.5", className)}>
    <svg viewBox="0 0 34 34" className="size-8" aria-hidden="true">
      <defs><linearGradient id="cue-logo" x1="4" y1="3" x2="30" y2="31"><stop stopColor="#e9fbff"/><stop offset=".46" stopColor="#4169e1"/><stop offset="1" stopColor="#7c5cf0"/></linearGradient></defs>
      <path d="M7 9.5A6.5 6.5 0 0 1 13.5 3h7A6.5 6.5 0 0 1 27 9.5v8A6.5 6.5 0 0 1 20.5 24H17l-5.9 5.2c-.8.7-2.1.1-2-1l.5-4.7A6.5 6.5 0 0 1 7 18V9.5Z" fill="url(#cue-logo)"/>
      <circle cx="13" cy="13.5" r="1.5" fill="#071014"/><circle cx="17" cy="13.5" r="1.5" fill="#071014"/><circle cx="21" cy="13.5" r="1.5" fill="#071014"/>
    </svg>
    {!compact && <span className="cue-logo-text text-[17px] font-bold tracking-[-.04em]">CuePop</span>}
  </div>;
}
