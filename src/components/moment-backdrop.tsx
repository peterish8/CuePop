import { cn } from "@/lib/utils";

export function MomentBackdrop({ imageUrl, blur = 0, intensity = 64, className }: { imageUrl?: string | null; blur?: number; intensity?: number; className?: string }) {
  if (!imageUrl) return <div aria-hidden="true" className={cn("absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(65,105,225,.16),transparent_34%),linear-gradient(135deg,rgba(65,105,225,.08),transparent_48%)]", className)} />;
  return <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
    <img src={imageUrl} alt="" className="h-full w-full object-cover" style={{ filter: `blur(${blur}px)`, transform: blur ? "scale(1.08)" : undefined }} />
    <div className="absolute inset-0 bg-[#06060b]" style={{ opacity: intensity / 100 }} />
  </div>;
}
