"use client";

import {useState} from "react";
import Link from "next/link";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {ChevronDown, ChevronRight, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Presentation, Settings} from "lucide-react";
import {DeckactiveLogo} from "@/components/logo";
import {IconButton} from "@/components/ui/icon-button";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {cn} from "@/lib/utils";
import type {Deck, User} from "@/lib/schema";

const links = [
  {href: "/workspace", label: "Decks", icon: LayoutDashboard, view: null},
  {href: "/workspace?view=live", label: "Live sessions", icon: Presentation, view: "live"},
  {href: "/workspace?view=settings", label: "Settings", icon: Settings, view: "settings"},
];

type RecentDeck = Pick<Deck, "id" | "title" | "updatedAt">;

export function AppShell({user, recentDecks = [], children}: {user: User; recentDecks?: RecentDeck[]; children: React.ReactNode}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const activeView = searchParams.get("view");

  return <div style={{"--cue-sidebar-width": collapsed ? "76px" : "248px"} as React.CSSProperties} className="deckactive-shell relative min-h-svh overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] md:grid md:grid-cols-[var(--cue-sidebar-width)_minmax(0,1fr)] md:transition-[grid-template-columns] md:duration-300 md:ease-out">
    <aside className={cn("relative z-10 hidden min-h-svh overflow-hidden border-r border-white/[.1] bg-[linear-gradient(155deg,rgba(8,15,36,.88),rgba(3,7,19,.78))] p-4 shadow-[18px_0_50px_rgba(0,0,0,.18)] backdrop-blur-2xl md:flex md:flex-col", collapsed && "px-3")}>
      <div className={cn("flex items-center justify-between px-2 py-3", collapsed && "flex-col gap-3 px-0")}>
        <Link href="/workspace"><DeckactiveLogo compact={collapsed}/></Link>
        <IconButton aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed((value) => !value)} className="shrink-0 border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]">
          {collapsed ? <PanelLeftOpen className="size-4"/> : <PanelLeftClose className="size-4"/>}
        </IconButton>
      </div>
      <nav className="mt-7 space-y-1">
        {links.map(({href, label, icon: Icon, view}) => {
          const isActive = pathname === "/workspace" && activeView === view;
          const isDecks = view === null;
          return <div key={label}>
            <Link data-active={isActive || undefined} href={href} title={collapsed ? label : undefined} className={cn("relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300", collapsed && "justify-center px-2", isActive ? "bg-transparent text-white before:absolute before:inset-y-2 before:left-0 before:w-px before:bg-[var(--color-primary-hover)] before:shadow-[0_0_14px_rgba(59,130,246,.95)] [&>svg]:text-[var(--color-primary-hover)]" : "text-[var(--color-foreground-subtle)] hover:bg-white/[.04] hover:text-white")}>
              <Icon className="size-4 shrink-0"/>
              <span className={cn("whitespace-nowrap transition-all duration-200", collapsed && "w-0 overflow-hidden opacity-0")}>{label}</span>
              {isDecks && !collapsed && recentDecks.length > 0 && <ChevronDown className="ml-auto size-3.5 text-[var(--color-foreground-subtle)]"/>}
            </Link>
            {isDecks && isActive && !collapsed && recentDecks.length > 0 && <div className="mx-3 mt-1 border-l border-[var(--color-border)] pl-3 py-1">
              <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--color-foreground-subtle)]">Recently edited</p>
              <div className="space-y-1">{recentDecks.map((deck) => <Link key={deck.id} href={`/workspace/decks/${deck.id}`} className="block truncate rounded-lg px-2 py-1.5 text-xs text-[var(--color-foreground-muted)] transition hover:bg-white/[.05] hover:text-white" title={deck.title}>{deck.title}</Link>)}</div>
            </div>}
          </div>;
        })}
      </nav>
      <div className={cn("mt-auto border-t border-[var(--color-border)] px-2 pt-4", collapsed && "px-0")}><button type="button" onClick={() => router.push("/workspace?view=profile")} title={collapsed ? "Open profile" : undefined} className={cn("group flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-colors hover:bg-white/[.04]", collapsed && "justify-center p-1")}><Avatar className="rounded-xl border border-[var(--color-border-strong)] bg-[linear-gradient(145deg,#172554,#0b1020_58%,#111827)] shadow-[0_6px_16px_rgba(0,0,0,.28)]"><AvatarFallback className="rounded-lg bg-transparent text-[var(--color-primary-hover)]">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className={cn("min-w-0 flex-1 pr-2", collapsed && "hidden")}><div className="truncate text-sm font-medium">{user.name}</div><div className="cue-body-sm truncate">{user.email}</div></div><ChevronRight className={cn("mr-1 size-4 shrink-0 text-[var(--color-foreground-subtle)] transition group-hover:translate-x-0.5 group-hover:text-white", collapsed && "hidden")}/></button></div>
    </aside>
    <div className="relative z-10 min-w-0"><main className="p-6 md:p-10 lg:p-14">{children}</main></div>
  </div>;
}
