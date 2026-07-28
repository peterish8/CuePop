"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, ImageIcon, MoreHorizontal, Plus, Radio, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { PageHeader } from "@/components/patterns/page-header";
import { StatCard } from "@/components/patterns/stat-card";
import { EmptyState } from "@/components/patterns/empty-state";
import type { Deck } from "@/lib/schema";
import { formatDate } from "@/lib/utils";

export function WorkspaceClient({ initialDecks }: { initialDecks: Deck[] }) {
 const router=useRouter(); const [decks,setDecks]=useState(initialDecks); const [creating,setCreating]=useState(false); const [importing,setImporting]=useState(false); const [title,setTitle]=useState("");
 async function createDeck(e:React.FormEvent){ e.preventDefault(); if(!title.trim())return; setCreating(true); const res=await fetch("/api/decks",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title})}); const body=await res.json(); setCreating(false); if(!res.ok){toast({title:"Could not create deck",description:body.error,tone:"error"});return;} setDecks([body.data,...decks]); setTitle(""); router.push(`/workspace/decks/${body.data.id}`); }
 async function importDeck(file:File){setImporting(true);try{const res=await fetch("/api/decks/import",{method:"POST",headers:{"content-type":"application/json"},body:await file.text()});const body=await res.json();if(!res.ok)throw new Error(body.error||"Import failed");toast({title:"Deck imported",description:"A fresh copy is ready in this workspace."});router.push(`/workspace/decks/${body.data.id}`)}catch(error){toast({title:"Could not import deck",description:error instanceof Error?error.message:"Choose a Deckactive export.",tone:"error"})}finally{setImporting(false)}}
 return <div className="mx-auto max-w-7xl">
  <PageHeader
   eyebrow="Your presentation workspace"
   title="Build once. Run the room."
   description="Upload image slides, place audience moments exactly where they belong and rehearse all four live surfaces before the event."
   actions={<div className="flex w-full max-w-lg gap-2"><form onSubmit={createDeck} className="flex min-w-0 flex-1 gap-2"><Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="New deck title"/><Button variant="primary" loading={creating} disabled={!title.trim()}><Plus className="size-4"/>Create</Button></form><label><input className="sr-only" type="file" accept="application/json,.json,.deckactive.json,.cuepop.json" onChange={(e)=>{const file=e.target.files?.[0];if(file)void importDeck(file);e.currentTarget.value=""}}/><Button type="button" variant="secondary" loading={importing} onClick={(e)=>e.currentTarget.parentElement?.querySelector("input")?.click()}><Upload className="size-4"/>Import</Button></label></div>}
  />
  <div className="mt-10 grid gap-4 sm:grid-cols-3"><StatCard icon={ImageIcon} value={decks.length} label="Decks"/><StatCard icon={Radio} value="Ready" label="Realtime room"/><StatCard icon={Sparkles} value="3" label="Keepsake designs"/></div>
  <section className="mt-12"><div className="flex items-center justify-between"><div><h2 className="cue-h3">Recent decks</h2><p className="cue-body-sm mt-1">Continue editing or start a live rehearsal.</p></div></div>
   {decks.length===0?<EmptyState className="mt-6" icon={Plus} title="Create your first live deck" description="Start with a title, then upload images and insert a poll."/>:
   <div className="mt-6 grid gap-4 lg:grid-cols-2">{decks.map((deck,index)=><Link href={`/workspace/decks/${deck.id}`} key={deck.id} className="group cue-hover-card cue-panel relative overflow-hidden p-5"><div className="absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle_at_70%_50%,rgba(65,105,225,.11),transparent_65%)] opacity-70"/><div className="relative flex gap-4"><div className="cue-hover-icon grid h-24 w-36 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"><div className="relative h-full w-full"><div className="absolute inset-x-3 top-3 h-1.5 rounded-full bg-white/[.12]"/><div className="absolute left-3 top-8 h-8 w-14 rounded bg-[rgba(65,105,225,.18)]"/><div className="absolute right-3 top-8 h-8 w-10 rounded bg-white/[.06]"/><div className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-white/[.08]"/></div></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><div className="cue-caption text-[var(--color-primary-hover)]">{index===0?"Recently edited":"Draft"}</div><h3 className="mt-2 truncate text-lg font-semibold tracking-[-.025em]">{deck.title}</h3></div><MoreHorizontal className="size-4 text-[var(--color-foreground-subtle)]"/></div><p className="cue-body-sm mt-2 line-clamp-2">{deck.description || "Image-first deck ready for slides and live moments."}</p><div className="mt-4 flex items-center gap-4 text-xs text-[var(--color-foreground-subtle)]"><span className="flex items-center gap-1.5"><CalendarDays className="size-3.5"/>{formatDate(deck.updatedAt)}</span><span className="ml-auto flex items-center gap-1 text-[var(--color-foreground-muted)] group-hover:text-white">Open <ArrowUpRight className="cue-hover-arrow size-3.5"/></span></div></div></div></Link>)}</div>}
  </section>
 </div>;
}
