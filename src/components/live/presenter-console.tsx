"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, ChevronLeft, ChevronRight, CircleStop, Copy, ExternalLink, Eye, Lock, Monitor, Play, QrCode, Radio, RotateCcw, Smartphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toaster";
import { QRPanel } from "@/components/live/qr-panel";
import { ReportPanel } from "@/components/report-panel";
import { useRoom } from "@/components/live/use-room";
import type { DeckItem } from "@/lib/schema";
import type { HostCommandType } from "@/lib/live/types";
import { MomentBackdrop } from "@/components/moment-backdrop";

export function PresenterConsole({code,token}:{code:string;token:string}){const {snapshot,connected,socket}=useRoom(code);const [items,setItems]=useState<DeckItem[]>([]);const [loading,setLoading]=useState(true);const [accessError,setAccessError]=useState<string|null>(null);const [panel,setPanel]=useState<null|"qr"|"report">("qr");const [commanding,setCommanding]=useState(false);const [remotePassword,setRemotePassword]=useState("");const [remoteReady,setRemoteReady]=useState(false);const [savingRemote,setSavingRemote]=useState(false);
 useEffect(()=>{if(!token){setAccessError("This presenter link is missing its private control token.");setLoading(false);return}fetch(`/api/live/${code}?token=${encodeURIComponent(token)}`).then(r=>r.json()).then(body=>{if(body.ok){setItems(body.data.items);setRemoteReady(Boolean(body.data.remotePasswordSet))}else{setAccessError(body.error||"This presenter link is invalid.");toast({title:"Presenter link rejected",description:body.error,tone:"error"})}}).catch(()=>setAccessError("The presenter controls could not be loaded.")).finally(()=>setLoading(false))},[code,token]);
 const current=useMemo(()=>{if(!snapshot?.currentItem)return null;const found=items.find(i=>i.id===snapshot.currentItem?.id);return found||{...snapshot.currentItem,notes:null}},[snapshot?.currentItem,items]);
 function command(command:HostCommandType){if(!socket){toast({title:"Realtime connection unavailable",tone:"error"});return}setCommanding(true);socket.emit("host:command",{code,token,command},(ack:any)=>{setCommanding(false);if(!ack?.ok)toast({title:"Command rejected",description:ack?.error||"Try again.",tone:"error"})})}
 async function copy(path:string){const url=`${window.location.origin}${path}`;await navigator.clipboard.writeText(url);toast({title:"Link copied",description:url})}
 async function saveRemotePassword(){if(remotePassword.trim().length<4){toast({title:"Use at least 4 characters",tone:"error"});return}setSavingRemote(true);try{const res=await fetch(`/api/live/${code}/remote-access`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({token,password:remotePassword})});const body=await res.json();if(!res.ok)throw new Error(body.error||"Could not save password");setRemoteReady(true);setRemotePassword("");toast({title:"Phone remote protected",description:"Open the phone link and enter this password to unlock controls."})}catch(error){toast({title:"Could not set password",description:error instanceof Error?error.message:"Try again",tone:"error"})}finally{setSavingRemote(false)}}
 if(loading)return <div className="grid min-h-svh place-items-center bg-[var(--color-surface)] text-[var(--color-foreground-subtle)]">Preparing presenter controls…</div>;
 if(accessError)return <main className="grid min-h-svh place-items-center bg-[var(--color-surface)] p-6 text-center text-white"><div className="max-w-md"><Lock className="mx-auto size-8 text-[var(--color-warning)]"/><h1 className="mt-5 text-2xl font-semibold">Presenter access denied</h1><p className="mt-3 text-sm leading-6 text-[var(--color-foreground-muted)]">{accessError}</p><Button asChild className="mt-6" variant="secondary"><Link href="/workspace">Return to workspace</Link></Button></div></main>;
 if(!snapshot)return <div className="grid min-h-svh place-items-center bg-[var(--color-surface)] text-[var(--color-foreground-subtle)]">Connecting to the live room…</div>;
 const isMoment=current&&current.type!=="slide";const canPrev=snapshot.currentIndex>0;const canNext=snapshot.currentIndex<snapshot.totalItems-1;
 return <main className="min-h-svh bg-[var(--color-background)] text-white"><header className="flex h-16 items-center gap-3 border-b border-[var(--color-border)] px-4 md:px-6"><IconButton asChild aria-label="Back to workspace"><Link href="/workspace"><ArrowLeft className="size-4"/></Link></IconButton><div className="min-w-0"><div className="truncate text-sm font-semibold">{snapshot.deckTitle}</div><div className="flex items-center gap-2 text-[11px] text-[var(--color-foreground-subtle)]"><span className={`size-1.5 rounded-full ${connected?"bg-[var(--color-success)]":"bg-[var(--color-warning)]"}`}/>{connected?"Live room connected":"Reconnecting"} · {code}</div></div><div className="ml-auto flex items-center gap-2"><Button size="sm" variant={panel==="qr"?"secondary":"ghost"} onClick={()=>setPanel(panel==="qr"?null:"qr")}><QrCode className="size-4"/><span className="hidden sm:inline">Join screen</span></Button><Button size="sm" variant={panel==="report"?"secondary":"ghost"} onClick={()=>setPanel(panel==="report"?null:"report")}><BarChart3 className="size-4"/><span className="hidden sm:inline">Report</span></Button><Button asChild size="sm" variant="secondary"><a href={`/stage/${code}`} target="_blank" rel="noreferrer"><Monitor className="size-4"/><span className="hidden sm:inline">Open stage</span></a></Button></div></header>
  <div className="grid min-h-[calc(100svh-64px)] lg:grid-cols-[minmax(0,1fr)_330px]">
   <section className="relative flex min-h-[52svh] items-center justify-center overflow-hidden bg-[var(--color-surface-muted)] p-5 md:p-8"><div className="absolute inset-0 cue-grid-noise opacity-25"/>{snapshot.status==="join"?<div className="relative cue-panel max-w-3xl p-8"><QRPanel code={code} attendeeCount={snapshot.attendeeCount}/></div>:current?.type==="slide"?<div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-black"><img src={current.imageUrl||""} alt={current.title} className="h-full w-full object-contain"/></div>:current?<div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] p-8 md:p-12"><MomentBackdrop imageUrl={current.backgroundImageUrl} blur={current.backgroundBlur} intensity={current.backgroundIntensity}/><div className="relative"><div className="flex justify-between text-xs"><span className="font-semibold uppercase tracking-[.14em] text-[var(--cyan-strong)]">{current.type}</span><span className="text-[var(--color-foreground-subtle)]">{snapshot.responseCount}/{snapshot.attendeeCount} responded</span></div><h1 className="mt-7 text-[clamp(2rem,4vw,4.4rem)] font-semibold leading-[1.02] tracking-[-.05em]">{current.question}</h1>{snapshot.results?<div className="mt-8 space-y-3">{snapshot.results.map(r=><div key={r.optionId} className="relative overflow-hidden rounded-xl border border-[var(--color-border)] p-4"><div className="absolute inset-y-0 left-0 bg-[rgba(65,105,225,.1)]" style={{width:`${r.percent}%`}}/><div className="relative flex justify-between gap-4"><span>{r.label}</span><b>{r.percent}%</b></div></div>)}</div>:<div className="mt-8 grid gap-3 sm:grid-cols-2">{current.options.map((o,index)=><div key={o.id} className="rounded-xl border border-[var(--color-border)] bg-black/20 p-4 text-sm text-[var(--color-foreground)]"><span className="mr-3 text-[var(--cyan-strong)]">{String.fromCharCode(65+index)}</span>{o.label}</div>)}</div>}</div></div>:<div className="relative text-center text-[var(--color-foreground-subtle)]">Select a timeline item.</div>}</section>

   <aside className="border-t border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:border-l lg:border-t-0">
    <div className="flex items-center justify-between">
     <div><div className="cue-caption text-[var(--color-foreground-subtle)]">Presenter controls</div><div className="mt-1 text-xs text-[var(--color-foreground-subtle)]">Only visible to you</div></div>
     <Badge className="capitalize">{snapshot.status}</Badge>
    </div>

    <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white/[.025] p-4">
     <div className="cue-caption text-[var(--color-foreground-subtle)]">Now showing</div>
     <div className="mt-2 text-sm font-semibold leading-6">{snapshot.status==="join"?"Dynamic join screen":current?.title||"No item selected"}</div>
     {current?.notes&&<p className="mt-3 text-xs leading-5 text-[var(--color-foreground-subtle)]">{current.notes}</p>}
    </div>

    <Separator className="my-5" />

    <div className="cue-caption mb-3 text-[var(--color-foreground-subtle)]">Playback</div>
    <div className="grid grid-cols-2 gap-2"><Button variant="secondary" disabled={!canPrev||commanding||snapshot.status==="join"||snapshot.status==="active"} onClick={()=>command("previous")}><ChevronLeft className="size-4"/>Previous</Button><Button variant="secondary" disabled={!canNext||commanding||snapshot.status==="join"||snapshot.status==="active"} onClick={()=>command("next")}>Next<ChevronRight className="size-4"/></Button></div>
    <div className="mt-2 space-y-2">{snapshot.status==="join"?<Button className="w-full" variant="primary" onClick={()=>command("start")}><Play className="size-4"/>Start first item</Button>:isMoment?<><Button className="w-full" variant="primary" disabled={snapshot.status!=="presenting"} onClick={()=>command("open")}><Radio className="size-4"/>Open voting</Button><div className="grid grid-cols-2 gap-2"><Button variant="secondary" disabled={snapshot.status!=="active"} onClick={()=>command("close")}><CircleStop className="size-4"/>Close</Button><Button variant="secondary" disabled={snapshot.status!=="closed"} onClick={()=>command("reveal")}><Eye className="size-4"/>Reveal</Button></div></>:<Button className="w-full" variant="secondary" disabled={!canNext} onClick={()=>command("next")}>Advance slide<ArrowRight className="size-4"/></Button>}</div>

    <Separator className="my-5" />

    <div className="cue-caption mb-3 text-[var(--color-foreground-subtle)]">Room</div>
    <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white/[.02] px-4 py-3">
     <span className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)]"><Users className="size-4"/>{snapshot.attendeeCount} joined</span>
     <label className="flex items-center gap-2 text-sm text-[var(--color-foreground-muted)]">Lock joining<Switch checked={snapshot.joinLocked} onCheckedChange={()=>command(snapshot.joinLocked?"unlockJoin":"lockJoin")}/></label>
    </div>
    <div className="mt-3 space-y-2"><Button className="w-full" variant="destructive" onClick={()=>confirm("End this live session?")&&command("end")}><CircleStop className="size-4"/>End session</Button><Button className="w-full" variant="ghost" onClick={()=>command("showJoin")}><RotateCcw className="size-4"/>Return to join screen</Button></div>

    <Separator className="my-5" />

    <div className="cue-caption mb-3 text-[var(--color-foreground-subtle)]">Phone remote</div>
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"><p className="text-xs leading-5 text-[var(--color-foreground-subtle)]">Set a room password. Your phone gets controls only after entering it; the laptop stage stays clean and full screen.</p><div className="mt-3 flex gap-2"><Input type="password" value={remotePassword} onChange={e=>setRemotePassword(e.target.value)} placeholder={remoteReady?"Set a new password":"Create a password"}/><Button size="sm" variant="secondary" loading={savingRemote} onClick={()=>void saveRemotePassword()}>Save</Button></div>{remoteReady&&<div className="mt-3 flex gap-2"><Button asChild size="sm" variant="secondary" className="flex-1"><a href={`/remote/${code}`} target="_blank" rel="noreferrer"><Smartphone className="size-3.5"/>Open phone remote</a></Button><IconButton aria-label="Copy remote link" onClick={()=>copy(`/remote/${code}`)}><Copy className="size-3.5"/></IconButton></div>}</div>
   </aside>
  </div>

  <Sheet open={!!panel} onOpenChange={(open)=>!open&&setPanel(null)}>
   <SheetContent side="right">
    <SheetHeader><SheetTitle>{panel==="qr"?"Audience join":"Session report"}</SheetTitle></SheetHeader>
    {panel==="qr"?<><QRPanel code={code} attendeeCount={snapshot.attendeeCount} stacked/><div className="mt-6 space-y-2"><Button className="w-full" variant="secondary" onClick={()=>copy(`/join/${code}`)}><Copy className="size-4"/>Copy attendee link</Button><Button className="w-full" variant="secondary" asChild><a href={`/stage/${code}`} target="_blank" rel="noreferrer"><ExternalLink className="size-4"/>Open projector stage</a></Button></div></>:<ReportPanel code={code} token={token}/>}
   </SheetContent>
  </Sheet>
 </main>}
