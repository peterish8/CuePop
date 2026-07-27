import Link from "next/link";
import { CuePopLogo } from "@/components/logo";
export function AuthShell({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
  return <main className="relative grid min-h-svh lg:grid-cols-[1.05fr_.95fr] bg-[#050507]">
    <div className="absolute inset-0 cue-grid-noise opacity-50 pointer-events-none" />
    <section className="relative hidden overflow-hidden border-r border-white/[.06] p-12 lg:flex lg:flex-col lg:justify-between">
      <Link href="/"><CuePopLogo /></Link>
      <div className="max-w-xl pb-14"><p className="cue-eyebrow">The room is part of the presentation</p><h1 className="mt-6 text-[clamp(3.5rem,6vw,6.3rem)] font-semibold leading-[.9] tracking-[-.065em]">Build the deck.<br/><span className="text-[var(--cyan)]">Run the room.</span></h1><p className="mt-7 max-w-md text-lg leading-8 text-[var(--muted)]">One controlled timeline for slides, QR joining, questions, reveals and a final keepsake.</p></div>
      <div className="relative h-48"><div className="absolute bottom-5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--cyan-strong)] to-transparent opacity-70 cue-glow-line"/><div className="absolute bottom-4 left-[16%] size-2 rounded-full bg-white shadow-[0_0_20px_#4169e1]"/><div className="absolute bottom-4 left-[55%] size-2 rounded-full bg-[#7c5cf0] shadow-[0_0_20px_#7c5cf0]"/><div className="absolute bottom-4 left-[82%] size-2 rounded-full bg-[#4169e1] shadow-[0_0_20px_#4169e1]"/></div>
    </section>
    <section className="relative flex items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="mb-12 inline-flex lg:hidden"><CuePopLogo /></Link><p className="cue-eyebrow">CuePop workspace</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.045em]">{title}</h2><p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p>{children}</div></section>
  </main>;
}
