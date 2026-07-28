"use client";

import Link from "next/link";
import { ArrowLeft, RotateCw, Sparkles } from "lucide-react";
import { DeckactiveLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="relative grid min-h-svh place-items-center overflow-hidden bg-[#070812] px-6 text-white">
    <div className="absolute -left-32 top-[-18rem] size-[38rem] rounded-full bg-[rgba(89,104,255,.22)] blur-[140px]" />
    <div className="absolute -bottom-48 right-[-8rem] size-[34rem] rounded-full bg-[rgba(32,205,202,.12)] blur-[130px]" />
    <div className="absolute inset-0 cue-grid-noise opacity-30" />
    <section className="relative w-full max-w-xl rounded-[2rem] border border-white/[.12] bg-[rgba(12,15,31,.68)] p-7 shadow-[0_35px_120px_rgba(0,0,0,.52)] backdrop-blur-2xl sm:p-10">
      <DeckactiveLogo />
      <div className="mt-14 grid size-14 place-items-center rounded-2xl border border-[rgba(255,127,135,.28)] bg-[rgba(255,127,135,.1)] shadow-[0_0_48px_rgba(255,127,135,.16)]"><Sparkles className="size-6 text-[var(--color-danger)]" /></div>
      <p className="mt-7 text-xs font-semibold uppercase tracking-[.18em] text-[var(--color-primary-hover)]">Moment interrupted</p>
      <h1 className="mt-3 text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-[.96] tracking-[-.06em]">Let’s bring the room back.</h1>
      <p className="mt-5 max-w-md text-base leading-7 text-[var(--color-foreground-muted)]">Your presentation is safe. Reconnect this surface, then continue from the same live moment.</p>
      <div className="mt-9 flex flex-wrap gap-3"><Button size="lg" onClick={reset}><RotateCw className="size-4" />Reconnect room</Button><Button asChild size="lg" variant="secondary"><Link href="/workspace"><ArrowLeft className="size-4" />Back to workspace</Link></Button></div>
      <p className="mt-8 text-xs text-[var(--color-foreground-subtle)]">If it keeps happening, reopen the presenter link. Audience phones do not need to refresh.</p>
    </section>
  </main>;
}
