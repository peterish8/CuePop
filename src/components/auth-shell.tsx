import Link from "next/link";
import {DeckactiveLogo} from "@/components/logo";

export function AuthShell({title, copy, children}: {title: string; copy: string; children: React.ReactNode}) {
  return <main className="grid min-h-svh bg-[var(--color-background)] lg:grid-cols-[minmax(0,1fr)_minmax(480px,.92fr)]">
    <section className="relative flex min-h-svh items-center px-6 py-8 sm:px-10 lg:px-16 xl:px-24">
      <Link href="/home" className="absolute left-6 top-7 sm:left-10 lg:left-16 xl:left-24"><DeckactiveLogo/></Link>
      <div className="w-full max-w-md pt-14"><p className="cue-eyebrow">Deckactive workspace</p><h1 className="cue-h1 mt-5">{title}</h1><p className="cue-body-lg mt-4 max-w-sm">{copy}</p>{children}</div>
    </section>
    <aside className="relative hidden min-h-svh overflow-hidden border-l border-[var(--color-border)] bg-black lg:block">
      <img src="/art/deckactive-auth-panels.png" alt="Layered blue presentation panels" className="absolute inset-0 h-full w-full object-contain object-bottom"/>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.32),transparent_42%)]"/>
    </aside>
  </main>;
}
