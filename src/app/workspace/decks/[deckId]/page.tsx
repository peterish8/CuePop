import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { AppShell } from "@/components/app-shell";
import { DeckBuilder } from "@/components/deck-builder";
export default async function DeckPage({params}:{params:Promise<{deckId:string}>}){const user=await currentUser();if(!user)redirect("/login");const {deckId}=await params;const deck=repo.getDeck(deckId,user!.id);if(!deck)notFound();return <AppShell user={user!}><DeckBuilder initialDeck={deck!}/></AppShell>}
