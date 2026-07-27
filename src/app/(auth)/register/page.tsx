import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";
export const metadata: Metadata = { title: "Create account" };
export default function RegisterPage(){ return <AuthShell title="Create your live workspace." copy="Start with image slides, add a moment and run a private rehearsal in minutes."><AuthForm mode="register" /></AuthShell>; }
