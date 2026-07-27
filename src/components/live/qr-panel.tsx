"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Link2, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function QRPanel({ code, attendeeCount, compact=false, stacked=false }: { code:string; attendeeCount:number; compact?:boolean; stacked?:boolean }) {
 const [url,setUrl]=useState("");
 useEffect(()=>{const configured=(process.env.NEXT_PUBLIC_APP_URL||"").replace(/\/$/,"");setUrl(`${configured||window.location.origin}/join/${code}`)},[code]);
 async function copy(){await navigator.clipboard.writeText(url);toast({title:"Join link copied"})}
 return <div className={compact?"flex items-center gap-4":stacked?"grid gap-5":"grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center"}>
  <div className={`rounded-2xl bg-white ${compact?"p-2":"p-4"}`}>{url&&<QRCodeSVG value={url} size={compact?104:188} level="M" fgColor="#07090b" bgColor="#ffffff"/>}</div>
  <div className={compact?"min-w-0":""}><div className="cue-caption text-[var(--color-primary-hover)]">Join CuePop</div><div className={`${compact?"mt-1 text-2xl":"mt-3 text-5xl"} font-semibold tracking-[.08em]`}>{code}</div><div className="mt-3 flex items-center gap-2 text-sm text-[var(--color-foreground-muted)]"><Wifi className="size-4 text-[var(--color-success)]"/>{attendeeCount} joined</div>{!compact&&<Button className="mt-5" variant="secondary" size="sm" onClick={copy}><Copy className="size-3.5"/>Copy join link</Button>}<p className="cue-caption mt-3 max-w-xs truncate normal-case tracking-normal text-[var(--color-foreground-subtle)]"><Link2 className="mr-1 inline size-3"/>{url||"Preparing link…"}</p></div>
 </div>
}
