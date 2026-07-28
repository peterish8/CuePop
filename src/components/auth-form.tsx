"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { toast } from "@/components/ui/toaster";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter(); const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true);
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not continue.");
      toast({ title: mode === "login" ? "Welcome back" : "Workspace created", description: "Opening your Deckactive workspace." });
      router.push("/workspace"); router.refresh();
    } catch (error) { toast({ title: "Could not sign in", description: error instanceof Error ? error.message : "Try again.", tone: "error" }); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5">
    <Button type="button" variant="secondary" className="w-full" size="lg" onClick={() => window.location.assign("/api/auth/google")}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none"><path d="M21.8 12.23c0-.72-.06-1.25-.2-1.8H12v3.65h5.63a4.8 4.8 0 0 1-2.08 3.15l3.08 2.39c1.8-1.66 2.85-4.1 2.85-7.39Z" fill="#4285F4"/><path d="M12 22c2.75 0 5.06-.91 6.75-2.48l-3.08-2.39c-.85.57-1.95.97-3.67.97-2.66 0-4.92-1.8-5.73-4.21l-3.18 2.45A10.2 10.2 0 0 0 12 22Z" fill="#34A853"/><path d="M6.27 13.89A6.12 6.12 0 0 1 5.95 12c0-.66.12-1.3.32-1.89L3.09 7.66A10.2 10.2 0 0 0 1.8 12c0 1.58.38 3.08 1.29 4.34l3.18-2.45Z" fill="#FBBC05"/><path d="M12 5.9c1.87 0 3.55.64 4.87 1.89l3.65-3.56C17.05.99 14.75 0 12 0a10.2 10.2 0 0 0-8.91 5.66l3.18 2.45C7.08 7.7 9.34 5.9 12 5.9Z" fill="#EA4335"/></svg>
      Continue with Google
    </Button>
    <div className="flex items-center gap-3 text-xs uppercase tracking-[.16em] text-white/[.36]"><span className="h-px flex-1 bg-white/[.1]"/>or continue with email<span className="h-px flex-1 bg-white/[.1]"/></div>
    {mode === "register" && <FormField label="Your name" htmlFor="name"><Input id="name" autoComplete="name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Prathick" required /></FormField>}
    <FormField label="Email" htmlFor="email"><Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required /></FormField>
    <FormField label="Password" htmlFor="password"><Input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} minLength={8} required /></FormField>
    <Button className="w-full" size="lg" loading={loading}>{mode === "login" ? "Enter workspace" : "Create workspace"}<ArrowRight className="size-4"/></Button>
    <p className="cue-body-sm text-center">{mode === "login" ? <>New to Deckactive? <Link className="text-white hover:text-[var(--color-primary-hover)]" href="/register">Create an account</Link></> : <>Already have an account? <Link className="text-white hover:text-[var(--color-primary-hover)]" href="/login">Sign in</Link></>}</p>
  </form>;
}
