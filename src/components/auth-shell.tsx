import Link from "next/link";
import { CuePopLogo } from "@/components/logo";
export function AuthShell({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
  return <main className="relative grid min-h-svh lg:grid-cols-[1.05fr_.95fr] bg-[var(--color-background)]">
    <div className="absolute inset-0 cue-grid-noise opacity-50 pointer-events-none" />
    <section className="relative hidden overflow-hidden border-r border-[var(--color-border)] p-12 lg:flex lg:flex-col lg:justify-between">
      <Link href="/home"><CuePopLogo /></Link>
      <div className="max-w-xl pb-14"><p className="cue-eyebrow">The room is part of the presentation</p><h1 className="cue-display mt-6">Build the deck.<br/><span className="text-[var(--color-primary-hover)]">Run the room.</span></h1><p className="cue-body-lg mt-7 max-w-md">One controlled timeline for slides, QR joining, questions, reveals and a final keepsake.</p></div>
      <div className="relative h-48"><div className="absolute bottom-5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-hover)] to-transparent opacity-70 cue-glow-line"/><div className="absolute bottom-4 left-[16%] size-2 rounded-full bg-white shadow-[0_0_20px_var(--color-primary-hover)]"/><div className="absolute bottom-4 left-[55%] size-2 rounded-full bg-[var(--color-accent-hover)] shadow-[0_0_20px_var(--color-accent-hover)]"/><div className="absolute bottom-4 left-[82%] size-2 rounded-full bg-[var(--color-primary-hover)] shadow-[0_0_20px_var(--color-primary-hover)]"/></div>
    </section>
    <section className="relative flex items-center justify-center px-5 py-12"><div className="w-full max-w-md"><Link href="/home" className="mb-12 inline-flex lg:hidden"><CuePopLogo /></Link><p className="cue-eyebrow">CuePop workspace</p><h2 className="cue-h1 mt-4">{title}</h2><p className="cue-body-lg mt-3">{copy}</p>{children}</div></section>
  </main>;
}
