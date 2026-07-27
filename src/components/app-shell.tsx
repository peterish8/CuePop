"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Presentation, Settings, Sparkles } from "lucide-react";
import { CuePopLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/schema";

const links = [{ href: "/workspace", label: "Decks", icon: LayoutDashboard }, { href: "/workspace#live", label: "Live sessions", icon: Presentation }, { href: "/workspace#settings", label: "Settings", icon: Settings }];
export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
 const pathname=usePathname(); const router=useRouter();
 async function logout(){ await fetch("/api/auth/logout",{method:"POST"}); router.push("/"); router.refresh(); }
 return <div className="min-h-svh bg-[#080a0d] text-white md:grid md:grid-cols-[248px_1fr]">
   <aside className="hidden min-h-svh border-r border-white/[.065] bg-[#07090c] p-4 md:flex md:flex-col">
    <div className="px-2 py-3"><Link href="/"><CuePopLogo /></Link></div>
    <nav className="mt-7 space-y-1">{links.map(({href,label,icon:Icon})=><Link key={label} href={href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", pathname===href?"bg-white/[.075] text-white":"text-[#7f8995] hover:bg-white/[.04] hover:text-white")}><Icon className="size-4"/>{label}</Link>)}</nav>
    <div className="mt-auto"><div className="mb-3 rounded-xl border border-[rgba(77,127,224,.12)] bg-[rgba(77,127,224,.055)] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-[var(--cyan)]"><Sparkles className="size-3.5"/>{user.plan === "pro" ? "Demo Pro workspace" : "Free workspace"}</div><p className="mt-2 text-xs leading-5 text-[#83909b]">Live room controls, reports and curated keepsakes are enabled.</p></div><div className="flex items-center gap-3 border-t border-white/[.06] px-2 pt-4"><div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--violet)] text-xs font-bold text-[#071014]">{user.name.slice(0,2).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{user.name}</div><div className="truncate text-xs text-[#717b86]">{user.email}</div></div><button onClick={logout} aria-label="Sign out" className="text-[#737d87] hover:text-white"><LogOut className="size-4"/></button></div></div>
   </aside>
   <div className="min-w-0"><header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/[.06] bg-[#080a0d]/90 px-4 backdrop-blur-xl md:px-8"><Link href="/workspace" className="md:hidden"><CuePopLogo compact/></Link><div className="hidden text-xs font-medium uppercase tracking-[.14em] text-[#65707b] md:block">Host workspace</div><Button asChild variant="secondary" size="sm"><Link href="/">View website</Link></Button></header><main className="p-4 md:p-8 lg:p-10">{children}</main></div>
 </div>;
}
