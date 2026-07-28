import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Deck, DeckItem, KeepsakeTheme } from "@/lib/schema";

type RawItem = Omit<DeckItem, "deckId" | "createdAt" | "updatedAt">;
type RawDeck = { id: string; ownerId: string; title: string; description: string; waitingMessage: string; keepsakeThemes: string[]; items: RawItem[]; createdAt: number; updatedAt: number };

function client() { const url = process.env.NEXT_PUBLIC_CONVEX_URL; const secret = process.env.CONVEX_SERVER_SECRET; if (!url || !secret) throw new Error("Deckactive storage is not configured."); return { live: new ConvexHttpClient(url), secret }; }
function iso(value: number) { return new Date(value).toISOString(); }
function mapDeck(deck: any): Deck { return { id: String(deck.id), userId: deck.ownerId, title: deck.title, description: deck.description, waitingMessage: deck.waitingMessage, keepsakeThemes: deck.keepsakeThemes as KeepsakeTheme[], createdAt: iso(deck.createdAt), updatedAt: iso(deck.updatedAt), items: deck.items.map((item: any) => ({ ...item, revealMode: item.revealMode ?? "manual", deckId: String(deck.id), createdAt: iso(deck.updatedAt), updatedAt: iso(deck.updatedAt) })) }; }
function itemInput(item: Partial<DeckItem> & { id: string; type: DeckItem["type"] }): any { return { id: item.id, position: item.position ?? 0, type: item.type, title: item.title ?? (item.type === "slide" ? "Untitled slide" : "Untitled moment"), imageUrl: item.imageUrl ?? null, backgroundImageUrl: item.backgroundImageUrl ?? null, backgroundBlur: item.backgroundBlur ?? 0, backgroundIntensity: item.backgroundIntensity ?? 64, question: item.question ?? null, options: item.options ?? [], notes: item.notes ?? null, revealMode: item.revealMode ?? "manual" }; }

export const convexDecks = {
  async list(ownerId: string) { const { live, secret } = client(); return (await live.query(api.decks.list, { ownerId, serverSecret: secret })).map(mapDeck); },
  async get(id: string, ownerId: string) { const { live, secret } = client(); const deck = await live.query(api.decks.get, { id: id as any, ownerId, serverSecret: secret }); return deck ? mapDeck(deck) : null; },
  async create(ownerId: string, input: { title: string; description?: string }) { const { live, secret } = client(); return mapDeck(await live.mutation(api.decks.create, { ownerId, title: input.title, description: input.description ?? "", serverSecret: secret })); },
  async update(id: string, ownerId: string, input: Partial<Pick<Deck, "title" | "description" | "waitingMessage" | "keepsakeThemes">>) { const { live, secret } = client(); return mapDeck(await live.mutation(api.decks.update, { id: id as any, ownerId, serverSecret: secret, ...input })); },
  async remove(id: string, ownerId: string) { const { live, secret } = client(); await live.mutation(api.decks.remove, { id: id as any, ownerId, serverSecret: secret }); },
  async addItem(id: string, ownerId: string, item: Partial<DeckItem> & { id: string; type: DeckItem["type"] }) { const { live, secret } = client(); const deck = await live.mutation(api.decks.addItem, { id: id as any, ownerId, serverSecret: secret, item: itemInput(item) }); return mapDeck(deck).items!.at(-1)!; },
  async patchItem(id: string, ownerId: string, item: DeckItem) { const { live, secret } = client(); const deck = await live.mutation(api.decks.patchItem, { id: id as any, ownerId, serverSecret: secret, item: itemInput(item) }); return mapDeck(deck).items!.find(entry => entry.id === item.id) ?? null; },
  async deleteItem(id: string, ownerId: string, itemId: string) { const { live, secret } = client(); await live.mutation(api.decks.deleteItem, { id: id as any, ownerId, serverSecret: secret, itemId }); },
  async reorder(id: string, ownerId: string, orderedIds: string[]) { const { live, secret } = client(); const deck = await live.mutation(api.decks.reorder, { id: id as any, ownerId, serverSecret: secret, orderedIds }); return mapDeck(deck).items!; },
  async import(ownerId: string, input: Omit<Deck, "id" | "userId" | "createdAt" | "updatedAt">) { const { live, secret } = client(); return mapDeck(await live.mutation(api.decks.importDeck, { ownerId, serverSecret: secret, deck: { title: input.title, description: input.description, waitingMessage: input.waitingMessage, keepsakeThemes: input.keepsakeThemes, items: (input.items ?? []).map(itemInput) } })); },
};
