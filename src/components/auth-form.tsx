"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toaster";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter(); const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: mode === "login" ? "demo@cuepop.app" : "", password: mode === "login" ? "demo1234" : "" });
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not continue.");
      toast({ title: mode === "login" ? "Welcome back" : "Workspace created", description: "Opening your CuePop workspace." });
      router.push("/workspace"); router.refresh();
    } catch (error) { toast({ title: "Could not sign in", description: error instanceof Error ? error.message : "Try again.", tone: "error" }); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5">
    {mode === "register" && <div className="space-y-2"><Label htmlFor="name">Your name</Label><Input id="name" autoComplete="name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Prathick" required /></div>}
    <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></div>
    <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} minLength={8} required /></div>
    <Button className="w-full" size="lg" disabled={loading}>{loading ? <LoaderCircle className="size-4 animate-spin"/> : <>{mode === "login" ? "Enter workspace" : "Create workspace"}<ArrowRight className="size-4"/></>}</Button>
    <p className="text-center text-sm text-[var(--faint)]">{mode === "login" ? <>New to CuePop? <Link className="text-white hover:text-[var(--cyan)]" href="/register">Create an account</Link></> : <>Already have an account? <Link className="text-white hover:text-[var(--cyan)]" href="/login">Sign in</Link></>}</p>
  </form>;
}
