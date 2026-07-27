import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { WorkspaceClient } from "@/components/workspace-client";
export default async function WorkspacePage(){ const user=await currentUser(); if(!user)redirect("/login"); return <AppShell user={user!}><WorkspaceClient initialDecks={repo.listDecks(user!.id)}/></AppShell>; }
