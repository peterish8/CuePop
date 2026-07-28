import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { convexDecks } from "@/lib/convex-decks";
import { AppShell } from "@/components/app-shell";
import { WorkspaceClient } from "@/components/workspace-client";
export default async function WorkspacePage(){
  const user=await currentUser();
  if(!user)redirect("/login");

  const isLocalDevelopmentHost=process.env.NODE_ENV==="development"&&user.id==="local-development-host";
  const initialDecks=(isLocalDevelopmentHost?[]:await convexDecks.list(user.id)).sort((left,right)=>Date.parse(right.updatedAt)-Date.parse(left.updatedAt));

  return <AppShell user={user} recentDecks={initialDecks.slice(0,4)}><WorkspaceClient initialDecks={initialDecks} user={user}/></AppShell>;
}
