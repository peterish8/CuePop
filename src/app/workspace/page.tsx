import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { convexDecks } from "@/lib/convex-decks";
import { AppShell } from "@/components/app-shell";
import { WorkspaceClient } from "@/components/workspace-client";
export default async function WorkspacePage(){ const user=await currentUser(); if(!user)redirect("/login"); return <AppShell user={user!}><WorkspaceClient initialDecks={await convexDecks.list(user!.id)}/></AppShell>; }
