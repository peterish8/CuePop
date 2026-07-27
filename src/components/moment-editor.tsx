"use client";
import { useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import type { DeckItem, DeckItemType, PollOption } from "@/lib/schema";

export type MomentDraft={type:DeckItemType;title:string;question:string;notes:string;options:PollOption[]};
export function MomentEditor({type,initial,onSave,onCancel}:{type:"poll"|"quiz";initial?:DeckItem;onSave:(draft:MomentDraft)=>Promise<void>;onCancel:()=>void}){
 const [saving,setSaving]=useState(false); const [title,setTitle]=useState(initial?.title|| (type==="quiz"?"Knowledge check":"Room pulse")); const [question,setQuestion]=useState(initial?.question||""); const [notes,setNotes]=useState(initial?.notes||"");
 const [options,setOptions]=useState<PollOption[]>(initial?.options?.length?initial.options:[{id:nanoid(6),label:""},{id:nanoid(6),label:""}]);
 const valid=useMemo(()=>question.trim().length>2&&options.filter(o=>o.label.trim()).length>=2&&(type!=="quiz"||options.some(o=>o.isCorrect)),[question,options,type]);
 function change(id:string,patch:Partial<PollOption>){setOptions(current=>current.map(o=>o.id===id?{...o,...patch}:type==="quiz"&&patch.isCorrect?{...o,isCorrect:false}:o))}
 async function submit(e:React.FormEvent){e.preventDefault();if(!valid)return;setSaving(true);await onSave({type,title,question,notes,options:options.filter(o=>o.label.trim())});setSaving(false)}
 return <form onSubmit={submit} className="space-y-5"><div><p className="cue-eyebrow">{type==="quiz"?"Quiz moment":"Poll moment"}</p><h3 className="mt-2 text-xl font-semibold">{initial?"Edit live moment":"Insert a live moment"}</h3></div>
  <FormField label="Internal title"><Input value={title} onChange={e=>setTitle(e.target.value)} required/></FormField>
  <FormField label="Question shown to the room"><Textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="What should the room respond to?" required/></FormField>
  <FormField label="Options" hint={type==="quiz"?"Select the correct answer using the letter button.":undefined}><div className="space-y-2">{options.map((option,index)=><div key={option.id} className="flex items-center gap-2"><IconButton type="button" variant="ghost" onClick={()=>type==="quiz"&&change(option.id,{isCorrect:true})} className={cnOptionButton(option.isCorrect)} aria-label={type==="quiz"?`Mark option ${index+1} as correct`:`Option ${index+1}`}><span className="text-xs font-semibold">{option.isCorrect?<Check className="size-4"/>:String.fromCharCode(65+index)}</span></IconButton><Input value={option.label} onChange={e=>change(option.id,{label:e.target.value})} placeholder={`Option ${index+1}`}/><IconButton type="button" variant="ghost" onClick={()=>setOptions(o=>o.filter(x=>x.id!==option.id))} disabled={options.length<=2} aria-label={`Remove option ${index+1}`} className="hover:text-[var(--color-danger)]"><Trash2 className="size-4"/></IconButton></div>)}</div><Button type="button" size="sm" variant="ghost" onClick={()=>setOptions(o=>[...o,{id:nanoid(6),label:""}])} disabled={options.length>=8}><Plus className="size-3.5"/>Add option</Button></FormField>
  <FormField label="Presenter note (optional)"><Textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Only visible in presenter controls."/></FormField>
  <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit" variant="primary" disabled={!valid} loading={saving}>Save moment</Button></div>
 </form>
}
function cnOptionButton(isCorrect?: boolean) {
 return isCorrect ? "border border-[var(--color-success)] bg-[rgba(110,215,178,.1)] text-[var(--color-success)]" : "border border-[var(--color-border-strong)] text-[var(--color-foreground-subtle)]";
}
