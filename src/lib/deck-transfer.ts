import { z } from "zod";
import { deckItemCreateSchema } from "@/lib/deck-validation";
import type { Deck } from "@/lib/schema";

const transferSchema = z.object({
  // Keep CuePop exports importable so hosts do not lose past decks during the rename.
  format: z.union([z.literal("deckactive-deck"), z.literal("cuepop-deck")]), version: z.literal(1), exportedAt: z.string().datetime(),
  deck: z.object({
    title: z.string().trim().min(2).max(100), description: z.string().trim().max(400),
    waitingMessage: z.string().trim().min(2).max(180), keepsakeThemes: z.array(z.enum(["signal", "midnight", "paper"])).min(1).max(3),
    items: z.array(deckItemCreateSchema).max(120),
  }),
}).strict();

export function createDeckTransfer(deck: Deck) {
  return { format: "deckactive-deck" as const, version: 1 as const, exportedAt: new Date().toISOString(), deck: {
    title: deck.title, description: deck.description, waitingMessage: deck.waitingMessage, keepsakeThemes: deck.keepsakeThemes,
    items: (deck.items || []).sort((a, b) => a.position - b.position).map((item) => ({ type: item.type, title: item.title, imageUrl: item.imageUrl, backgroundImageUrl: item.backgroundImageUrl, backgroundBlur: item.backgroundBlur, backgroundIntensity: item.backgroundIntensity, question: item.question, options: item.options, notes: item.notes, revealMode: item.revealMode })),
  }};
}

export function parseDeckTransfer(input: unknown) { return transferSchema.safeParse(input); }
