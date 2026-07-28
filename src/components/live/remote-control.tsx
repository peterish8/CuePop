"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CircleStop, Eye, Lock, Play, Radio, RotateCcw, Unlock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CuePopLogo } from "@/components/logo";
import { toast } from "@/components/ui/toaster";
import { useRoom } from "@/components/live/use-room";
import { MomentBackdrop } from "@/components/moment-backdrop";
import type { DeckItem } from "@/lib/schema";
import type { HostCommandType } from "@/lib/live/types";

type ApiResponse = { ok: boolean; data?: { items?: DeckItem[]; remoteToken?: string }; error?: string };
type CommandAck = { ok: boolean; error?: string };

export function RemoteControl({ code }: { code: string }) {
  const { snapshot, connected, socket } = useRoom(code);
  const [items, setItems] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [remoteToken, setRemoteToken] = useState("");
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => { const saved = sessionStorage.getItem(`cuepop.remote.${code}`); setRemoteToken(saved || ""); setLoading(false); }, [code]);
  useEffect(() => {
    if (!remoteToken) return;
    setLoading(true); setAccessError(null);
    fetch(`/api/live/${code}?remoteToken=${encodeURIComponent(remoteToken)}`).then((response) => response.json() as Promise<ApiResponse>).then((body) => {
      if (body.ok) setItems(body.data?.items || []);
      else { sessionStorage.removeItem(`cuepop.remote.${code}`); setRemoteToken(""); setAccessError(body.error || "Remote access expired."); }
    }).catch(() => setAccessError("The phone remote could not be loaded.")).finally(() => setLoading(false));
  }, [code, remoteToken]);

  async function unlock(event: React.FormEvent) {
    event.preventDefault(); setUnlocking(true);
    try {
      const response = await fetch(`/api/live/${code}/remote-access`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) });
      const body = await response.json() as ApiResponse;
      if (!response.ok || !body.data?.remoteToken) throw new Error(body.error || "Could not unlock controls");
      sessionStorage.setItem(`cuepop.remote.${code}`, body.data.remoteToken); setRemoteToken(body.data.remoteToken); setPassword("");
    } catch (error) { setAccessError(error instanceof Error ? error.message : "Could not unlock controls."); } finally { setUnlocking(false); }
  }

  const current = useMemo(() => { if (!snapshot?.currentItem) return null; return items.find((item) => item.id === snapshot.currentItem?.id) || { ...snapshot.currentItem, notes: null }; }, [snapshot?.currentItem, items]);
  function command(next: HostCommandType) { if (!socket) { toast({ title: "Realtime connection unavailable", tone: "error" }); return; } socket.emit("host:command", { code, token: remoteToken, command: next }, (ack: CommandAck) => { if (!ack?.ok) toast({ title: "Command rejected", description: ack?.error, tone: "error" }); }); }

  if (!remoteToken && !loading) return <main className="grid min-h-svh place-items-center bg-[var(--color-surface)] p-6 text-white"><form onSubmit={unlock} className="w-full max-w-sm rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"><CuePopLogo /><h1 className="mt-8 text-3xl font-semibold tracking-[-.05em]">Unlock the controls.</h1><p className="mt-3 text-sm leading-6 text-[var(--color-foreground-muted)]">Enter the password set on the presenter laptop.</p><Input className="mt-6" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Room password" autoFocus /><Button className="mt-3 w-full" type="submit" loading={unlocking}>Unlock remote</Button>{accessError && <p className="mt-3 text-center text-xs text-[var(--color-warning)]">{accessError}</p>}</form></main>;
  if (loading) return <main className="grid min-h-svh place-items-center bg-[var(--color-surface)] text-[var(--color-foreground-subtle)]">Connecting remote…</main>;
  if (accessError) return <main className="grid min-h-svh place-items-center bg-[var(--color-surface)] p-6 text-center text-white"><div className="max-w-sm"><Lock className="mx-auto size-8 text-[var(--color-warning)]" /><h1 className="mt-5 text-2xl font-semibold">Remote access denied</h1><p className="mt-3 text-sm leading-6 text-[var(--color-foreground-muted)]">{accessError}</p></div></main>;
  if (!snapshot) return <main className="grid min-h-svh place-items-center bg-[var(--color-surface)] text-[var(--color-foreground-subtle)]">Waiting for the live room…</main>;

  const moment = current && current.type !== "slide";
  return <main className="min-h-svh bg-[var(--color-surface)] px-5 pb-[252px] pt-6 text-white"><div className="mx-auto max-w-md"><header className="flex items-center justify-between"><CuePopLogo /><div className="flex items-center gap-2 text-xs text-[var(--color-foreground-subtle)]"><span className={`size-2 rounded-full ${connected ? "bg-[var(--color-success)]" : "bg-[var(--color-warning)]"}`} />{code}</div></header>
    <section className="mt-6 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-[var(--shadow-md)]"><div className="relative aspect-video bg-black">{snapshot.status === "join" ? <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_72%_20%,rgba(65,105,225,.22),transparent_38%)] text-center"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--cyan-strong)]">Join screen</p><p className="mt-2 text-lg font-semibold">Ready for the room</p></div></div> : current?.type === "slide" ? <img src={current.imageUrl || ""} alt={current.title} className="h-full w-full object-contain" /> : <div className="relative h-full overflow-hidden bg-[var(--color-surface-elevated)] p-4"><MomentBackdrop imageUrl={current?.backgroundImageUrl} blur={current?.backgroundBlur} intensity={current?.backgroundIntensity}/><div className="relative flex h-full flex-col">{snapshot.status === "revealed" && snapshot.results ? <><div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--cyan-strong)]"><span>Results revealed</span><span>{snapshot.responseCount} answers</span></div><div className="mt-3 space-y-1.5">{[...snapshot.results].sort((a,b)=>b.count-a.count).slice(0,4).map((result)=><div key={result.optionId} className="relative overflow-hidden rounded-md border border-white/15 bg-black/20 px-2 py-1 text-[9px]"><div className="absolute inset-y-0 left-0 bg-[rgba(65,105,225,.28)]" style={{width:`${Math.max(result.percent,2)}%`}}/><div className="relative flex items-center justify-between gap-2"><span className="truncate">{result.label}</span><span className="font-semibold">{result.percent}%</span></div></div>)}</div></> : <><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--cyan-strong)]">{current?.type === "quiz" ? "Knowledge check" : "Live poll"}</div><p className="mt-auto max-w-[92%] text-sm font-semibold leading-snug">{current?.question}</p></>}</div></div>}</div><div className="flex items-center justify-between px-4 py-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[var(--color-foreground-subtle)]">{snapshot.status === "revealed" ? "Results live on every screen" : "Now showing"}</p><p className="mt-1 text-sm font-medium">{snapshot.status === "join" ? "Dynamic join screen" : current?.title || "No item"}</p></div><span className="text-xs text-[var(--color-foreground-subtle)]">{Math.max(snapshot.currentIndex + 1, 0)} / {snapshot.totalItems}</span></div></section>
    {current?.notes && <p className="mt-4 rounded-2xl border border-[var(--color-border)] bg-white/[.025] p-4 text-sm leading-6 text-[var(--color-foreground-muted)]">{current.notes}</p>}
    <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-foreground-muted)]"><Users className="size-4 text-[var(--cyan-strong)]" />{snapshot.attendeeCount} joined {moment && <>· {snapshot.responseCount} answered</>}</div></div>
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--color-border)] bg-[rgba(8,10,18,.94)] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl"><div className="mx-auto max-w-md"><div className="grid grid-cols-2 gap-3"><Button size="lg" variant="secondary" disabled={snapshot.currentIndex <= 0 || snapshot.status === "join" || snapshot.status === "active"} onClick={() => command("previous")}><ChevronLeft className="size-5" />Previous</Button><Button size="lg" variant="secondary" disabled={snapshot.currentIndex >= snapshot.totalItems - 1 || snapshot.status === "join" || snapshot.status === "active"} onClick={() => command("next")}>Next<ChevronRight className="size-5" /></Button></div>{snapshot.status === "join" ? <Button size="lg" className="mt-3 w-full" variant="primary" onClick={() => command("start")}><Play className="size-5" />Start presentation</Button> : moment ? <div className="mt-3 space-y-3"><Button size="lg" className="w-full" variant="primary" disabled={snapshot.status !== "presenting"} onClick={() => command("open")}><Radio className="size-5" />Open voting</Button><div className="grid grid-cols-2 gap-3"><Button size="lg" variant="secondary" disabled={snapshot.status !== "active"} onClick={() => command("close")}><CircleStop className="size-5" />Close</Button><Button size="lg" variant="secondary" disabled={snapshot.status !== "closed"} onClick={() => command("reveal")}><Eye className="size-5" />Reveal</Button></div></div> : <Button size="lg" className="mt-3 w-full" variant="primary" disabled={snapshot.currentIndex >= snapshot.totalItems - 1} onClick={() => command("next")}><ChevronRight className="size-5" />Advance slide</Button>}<div className="mt-3 grid grid-cols-2 gap-3"><Button size="sm" variant="ghost" onClick={() => command(snapshot.joinLocked ? "unlockJoin" : "lockJoin")}>{snapshot.joinLocked ? <><Unlock className="size-4" />Unlock join</> : <><Lock className="size-4" />Lock join</>}</Button><Button size="sm" variant="ghost" onClick={() => command("showJoin")}><RotateCcw className="size-4" />Join screen</Button></div></div></nav>
  </main>;
}
