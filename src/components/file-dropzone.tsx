"use client";
import { useRef, useState } from "react";
import { ImagePlus, LoaderCircle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

export function FileDropzone({ onUploaded }: { onUploaded: (file: { url:string; name:string }) => Promise<void> | void }) {
 const input=useRef<HTMLInputElement>(null); const [drag,setDrag]=useState(false); const [loading,setLoading]=useState(false);
 async function upload(file?:File){if(!file)return;setLoading(true);try{const data=new FormData();data.set("file",file);const res=await fetch("/api/uploads",{method:"POST",body:data});const body=await res.json();if(!res.ok)throw new Error(body.error);await onUploaded({url:body.data.url,name:file.name});toast({title:"Slide uploaded",description:file.name});}catch(error){toast({title:"Upload failed",description:error instanceof Error?error.message:"Try another image.",tone:"error"})}finally{setLoading(false);if(input.current)input.current.value=""}}
 return <div onDragOver={(e)=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={(e)=>{e.preventDefault();setDrag(false);void upload(e.dataTransfer.files[0])}} className={`rounded-2xl border border-dashed p-5 text-center transition ${drag?"border-[var(--cyan)] bg-[rgba(77,127,224,.06)]":"border-white/[.11] bg-white/[.025]"}`}>
  <div className="mx-auto grid size-10 place-items-center rounded-xl border border-white/[.08] bg-white/[.04]">{loading?<LoaderCircle className="size-4 animate-spin text-[var(--cyan-strong)]"/>:<UploadCloud className="size-4 text-[var(--cyan-strong)]"/>}</div>
  <p className="mt-3 text-sm font-medium">Drop a slide image here</p><p className="mt-1 text-xs text-[var(--color-foreground-subtle)]">PNG, JPEG, WebP or GIF · up to 10 MB</p>
  <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e)=>void upload(e.target.files?.[0])}/>
  <Button type="button" size="sm" variant="secondary" className="mt-4" onClick={()=>input.current?.click()} disabled={loading}><ImagePlus className="size-3.5"/>Choose image</Button>
 </div>
}
