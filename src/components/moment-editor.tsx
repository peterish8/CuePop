"use client";
import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DeckItem, DeckItemType, PollOption } from "@/lib/schema";

export type MomentDraft={type:DeckItemType;title:string;question:string;notes:string;options:PollOption[]};
export function MomentEditor({type,initial,onSave,onCancel}:{type:"poll"|"quiz";initial?:DeckItem;onSave:(draft:MomentDraft)=>Promise<void>;onCancel:()=>void}){
 const [saving,setSaving]=useState(false); const [title,setTitle]=useState(initial?.title|| (type==="quiz"?"Knowledge check":"Room pulse")); const [question,setQuestion]=useState(initial?.question||""); const [notes,setNotes]=useState(initial?.notes||"");
 const [options,setOptions]=useState<PollOption[]>(initial?.options?.length?initial.options:[{id:nanoid(6),label:""},{id:nanoid(6),label:""}]);
 const valid=useMemo(()=>question.trim().length>2&&options.filter(o=>o.label.trim()).length>=2&&(type!=="quiz"||options.some(o=>o.isCorrect)),[question,options,type]);
 function change(id:string,patch:Partial<PollOption>){setOptions(current=>current.map(o=>o.id===id?{...o,...patch}:type==="quiz"&&patch.isCorrect?{...o,isCorrect:false}:o))}
 async function submit(e:React.FormEvent){e.preventDefault();if(!valid)return;setSaving(true);await onSave({type,title,question,notes,options:options.filter(o=>o.label.trim())});setSaving(false)}
 return <form onSubmit={submit} className="space-y-5"><div><p className="cue-eyebrow">{type==="quiz"?"Quiz moment":"Poll moment"}</p><h3 className="mt-2 text-xl font-semibold">{initial?"Edit live moment":"Insert a live moment"}</h3></div>
  <div className="space-y-2"><Label>Internal title</Label><Input value={title} onChange={e=>setTitle(e.target.value)} required/></div>
  <div className="space-y-2"><Label>Question shown to the room</Label><Textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="What should the room respond to?" required/></div>
  <div className="space-y-2"><Label>Options</Label><div className="space-y-2">{options.map((option,index)=><div key={option.id} className="flex items-center gap-2"><button type="button" onClick={()=>type==="quiz"&&change(option.id,{isCorrect:true})} className={`grid size-9 shrink-0 place-items-center rounded-xl border ${option.isCorrect?"border-[var(--success)] bg-[rgba(110,215,178,.1)] text-[var(--success)]":"border-white/[.09] text-[#68737d]"}`} aria-label={type==="quiz"?"Mark correct option":`Option ${index+1}`}><span className="text-xs font-semibold">{option.isCorrect?<Check className="size-4"/>:String.fromCharCode(65+index)}</span></button><Input value={option.label} onChange={e=>change(option.id,{label:e.target.value})} placeholder={`Option ${index+1}`}/><button type="button" onClick={()=>setOptions(o=>o.filter(x=>x.id!==option.id))} disabled={options.length<=2} className="text-[#68737d] hover:text-[var(--danger)] disabled:opacity-25"><Trash2 className="size-4"/></button></div>)}</div><Button type="button" size="sm" variant="ghost" onClick={()=>setOptions(o=>[...o,{id:nanoid(6),label:""}])} disabled={options.length>=8}><Plus className="size-3.5"/>Add option</Button>{type==="quiz"&&<p className="text-xs text-[#707b86]">Select the correct answer using the letter button.</p>}</div>
  <div className="space-y-2"><Label>Presenter note (optional)</Label><Textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Only visible in presenter controls."/></div>
  <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit" variant="accent" disabled={!valid||saving}>{saving?"Saving…":"Save moment"}</Button></div>
 </form>
}
