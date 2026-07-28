import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
export const metadata: Metadata = { title: "Sign in" };
export default async function LoginPage(){ if(await currentUser())redirect("/workspace"); return <AuthShell title="Welcome back." copy="Open your decks, start a room and keep every surface in sync."><AuthForm mode="login" /></AuthShell>; }
