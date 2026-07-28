"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Presentation, Settings, Sparkles } from "lucide-react";
import { CuePopLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/schema";

const links = [{ href: "/workspace", label: "Decks", icon: LayoutDashboard }, { href: "/workspace#live", label: "Live sessions", icon: Presentation }, { href: "/workspace#settings", label: "Settings", icon: Settings }];

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const [collapsed, setCollapsed] = useState(false);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); }
  return <div style={{ "--cue-sidebar-width": collapsed ? "76px" : "248px" } as React.CSSProperties} className="relative min-h-svh overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] md:grid md:grid-cols-[var(--cue-sidebar-width)_minmax(0,1fr)] md:transition-[grid-template-columns] md:duration-300 md:ease-out">
    <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-24 size-[420px] rounded-full bg-[rgba(8,46,162,.14)] blur-[110px]" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-0 size-[380px] rounded-full bg-[rgba(78,216,255,.06)] blur-[120px]" />
    <aside className={cn("relative z-10 hidden min-h-svh overflow-hidden border-r border-white/[.1] bg-[linear-gradient(155deg,rgba(8,15,36,.88),rgba(3,7,19,.78))] p-4 shadow-[18px_0_50px_rgba(0,0,0,.18)] backdrop-blur-2xl md:flex md:flex-col", collapsed && "px-3")}>
      <div className={cn("flex items-center px-2 py-3", collapsed && "justify-center")}><Link href="/"><CuePopLogo compact={collapsed} /></Link></div>
      <nav className="mt-7 space-y-1">{links.map(({ href, label, icon: Icon }) => <Link key={label} href={href} title={collapsed ? label : undefined} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300", collapsed && "justify-center px-2", pathname === href ? "border border-[rgba(78,216,255,.2)] bg-[linear-gradient(90deg,rgba(8,46,162,.3),rgba(78,216,255,.08))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_8px_24px_rgba(8,46,162,.12)]" : "border border-transparent text-[var(--color-foreground-subtle)] hover:border-white/[.08] hover:bg-white/[.05] hover:text-white")}><Icon className="size-4 shrink-0" /><span className={cn("whitespace-nowrap transition-all duration-200", collapsed && "w-0 overflow-hidden opacity-0")}>{label}</span></Link>)}</nav>
      <div className="mt-auto"><div className={cn("mb-3 rounded-xl border border-[rgba(65,105,225,.12)] bg-[rgba(65,105,225,.055)] p-3 transition-all", collapsed && "grid place-items-center p-2")}><div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-primary-hover)]"><Sparkles className="size-3.5 shrink-0" /><span className={cn(collapsed && "hidden")}>{user.plan === "pro" ? "Demo Pro workspace" : "Free workspace"}</span></div><p className={cn("cue-body-sm mt-2", collapsed && "hidden")}>Live room controls, reports and curated keepsakes are enabled.</p></div><div className={cn("flex items-center gap-3 border-t border-[var(--color-border)] px-2 pt-4", collapsed && "justify-center px-0")}><Avatar><AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className={cn("min-w-0 flex-1", collapsed && "hidden")}><div className="truncate text-sm font-medium">{user.name}</div><div className="cue-body-sm truncate">{user.email}</div></div><IconButton onClick={logout} aria-label="Sign out" className={cn("text-[var(--color-foreground-subtle)]", collapsed && "hidden")}><LogOut className="size-4" /></IconButton></div></div>
    </aside>
    <div className="relative z-10 min-w-0"><header className="sticky top-3 z-40 mx-3 flex h-14 items-center justify-between rounded-2xl border border-white/[.1] bg-[rgba(4,9,24,.72)] px-4 shadow-[0_14px_44px_rgba(0,0,0,.22),inset_0_1px_0_rgba(255,255,255,.07)] backdrop-blur-2xl md:mx-6 md:px-5"><Link href="/workspace" className="md:hidden"><CuePopLogo compact /></Link><div className="hidden items-center gap-3 md:flex"><IconButton aria-label={collapsed ? "Expand navigation" : "Collapse navigation"} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}</IconButton><div className="cue-caption text-[var(--cyan-strong)]">Host workspace</div></div><Button asChild variant="secondary" size="sm"><Link href="/">View website</Link></Button></header><main className="p-4 pt-7 md:p-8 md:pt-11 lg:p-10 lg:pt-12">{children}</main></div>
  </div>;
}
