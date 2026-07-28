import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { convexDecks } from "@/lib/convex-decks";
import { AppShell } from "@/components/app-shell";
import { DeckBuilder } from "@/components/deck-builder";
export default async function DeckPage({params}:{params:Promise<{deckId:string}>}){const user=await currentUser();if(!user)redirect("/login");const {deckId}=await params;const deck=await convexDecks.get(deckId,user!.id);if(!deck)notFound();return <AppShell user={user!}><DeckBuilder initialDeck={deck!}/></AppShell>}
