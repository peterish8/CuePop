import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
export const metadata: Metadata = { title: "Create account" };
export default async function RegisterPage(){ if(await currentUser())redirect("/workspace"); return <AuthShell title="Create your live workspace." copy="Start with image slides, add a moment and run a private rehearsal in minutes."><AuthForm mode="register" /></AuthShell>; }
