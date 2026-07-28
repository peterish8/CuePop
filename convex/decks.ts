import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const serverSecret = v.string();
const option = v.object({ id: v.string(), label: v.string(), isCorrect: v.optional(v.boolean()) });
const deckItem = v.object({
  id: v.string(), position: v.number(), type: v.union(v.literal("slide"), v.literal("poll"), v.literal("quiz")),
  title: v.string(), imageUrl: v.union(v.string(), v.null()), backgroundImageUrl: v.union(v.string(), v.null()),
  backgroundBlur: v.number(), backgroundIntensity: v.number(), question: v.union(v.string(), v.null()),
  options: v.array(option), notes: v.union(v.string(), v.null()), revealMode: v.optional(v.union(v.literal("manual"), v.literal("auto"))),
});
const deckInput = v.object({ title: v.string(), description: v.string(), waitingMessage: v.string(), keepsakeThemes: v.array(v.string()), items: v.array(deckItem) });
const deckResult = v.object({
  id: v.id("decks"), ownerId: v.string(), title: v.string(), description: v.string(), waitingMessage: v.string(), keepsakeThemes: v.array(v.string()), items: v.array(deckItem), createdAt: v.number(), updatedAt: v.number(),
});

function requireServer(secret: string) {
  if (!process.env.CONVEX_SERVER_SECRET || secret !== process.env.CONVEX_SERVER_SECRET) throw new ConvexError("Server authorization required.");
}
async function owned(ctx: { db: any }, id: any, ownerId: string) {
  const deck = await ctx.db.get(id);
  if (!deck || deck.ownerId !== ownerId) throw new ConvexError("Deck not found.");
  return deck;
}
function normalizeItems(items: Array<any>) {
  if (items.length > 120) throw new ConvexError("A deck can have at most 120 items.");
  const seen = new Set<string>();
  return items.map((item, position) => {
    if (seen.has(item.id)) throw new ConvexError("Deck item identifiers must be unique.");
    seen.add(item.id);
    return { ...item, position, revealMode: item.revealMode ?? "manual" };
  });
}
function toResult(deck: any) {
  return { id: deck._id, ownerId: deck.ownerId, title: deck.title, description: deck.description, waitingMessage: deck.waitingMessage, keepsakeThemes: deck.keepsakeThemes, items: deck.items.map((item: any) => ({ ...item, revealMode: item.revealMode ?? "manual" })), createdAt: deck.createdAt, updatedAt: deck.updatedAt };
}

export const list = query({
  args: { ownerId: v.string(), serverSecret }, returns: v.array(deckResult),
  handler: async (ctx, args) => { requireServer(args.serverSecret); return (await ctx.db.query("decks").withIndex("by_ownerId", q => q.eq("ownerId", args.ownerId)).order("desc").take(200)).map(toResult); },
});
export const get = query({
  args: { id: v.id("decks"), ownerId: v.string(), serverSecret }, returns: v.union(deckResult, v.null()),
  handler: async (ctx, args) => { requireServer(args.serverSecret); const deck = await ctx.db.get(args.id); return deck?.ownerId === args.ownerId ? toResult(deck) : null; },
});
export const create = mutation({
  args: { ownerId: v.string(), title: v.string(), description: v.string(), serverSecret }, returns: deckResult,
  handler: async (ctx, args) => { requireServer(args.serverSecret); const now = Date.now(); const id = await ctx.db.insert("decks", { ownerId: args.ownerId, title: args.title, description: args.description, waitingMessage: "Scan the code and join when you are ready.", keepsakeThemes: ["signal"], items: [], createdAt: now, updatedAt: now }); return toResult((await ctx.db.get(id))!); },
});
export const update = mutation({
  args: { id: v.id("decks"), ownerId: v.string(), serverSecret, title: v.optional(v.string()), description: v.optional(v.string()), waitingMessage: v.optional(v.string()), keepsakeThemes: v.optional(v.array(v.string())) }, returns: deckResult,
  handler: async (ctx, args) => { requireServer(args.serverSecret); const deck = await owned(ctx, args.id, args.ownerId); const { id: _id, ownerId: _ownerId, serverSecret: _secret, ...patch } = args; const clean = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)); await ctx.db.patch(deck._id, { ...clean, updatedAt: Date.now() }); return toResult((await ctx.db.get(deck._id))!); },
});
export const remove = mutation({
  args: { id: v.id("decks"), ownerId: v.string(), serverSecret }, returns: v.null(),
  handler: async (ctx, args) => { requireServer(args.serverSecret); const deck = await owned(ctx, args.id, args.ownerId); await ctx.db.delete(deck._id); return null; },
});
export const addItem = mutation({
  args: { id: v.id("decks"), ownerId: v.string(), serverSecret, item: deckItem }, returns: deckResult,
  handler: async (ctx, args) => { requireServer(args.serverSecret); const deck = await owned(ctx, args.id, args.ownerId); if (deck.items.length >= 120) throw new ConvexError("A deck can have at most 120 items."); if (deck.items.some((item: any) => item.id === args.item.id)) throw new ConvexError("This item already exists."); const items = normalizeItems([...deck.items, args.item]); await ctx.db.patch(deck._id, { items, updatedAt: Date.now() }); return toResult((await ctx.db.get(deck._id))!); },
});
export const patchItem = mutation({
  args: { id: v.id("decks"), ownerId: v.string(), serverSecret, item: deckItem }, returns: deckResult,
  handler: async (ctx, args) => { requireServer(args.serverSecret); const deck = await owned(ctx, args.id, args.ownerId); if (!deck.items.some((item: any) => item.id === args.item.id)) throw new ConvexError("Item not found."); const items = normalizeItems(deck.items.map((item: any) => item.id === args.item.id ? args.item : item)); await ctx.db.patch(deck._id, { items, updatedAt: Date.now() }); return toResult((await ctx.db.get(deck._id))!); },
});
export const deleteItem = mutation({
  args: { id: v.id("decks"), ownerId: v.string(), serverSecret, itemId: v.string() }, returns: deckResult,
  handler: async (ctx, args) => { requireServer(args.serverSecret); const deck = await owned(ctx, args.id, args.ownerId); const items = normalizeItems(deck.items.filter((item: any) => item.id !== args.itemId)); if (items.length === deck.items.length) throw new ConvexError("Item not found."); await ctx.db.patch(deck._id, { items, updatedAt: Date.now() }); return toResult((await ctx.db.get(deck._id))!); },
});
export const reorder = mutation({
  args: { id: v.id("decks"), ownerId: v.string(), serverSecret, orderedIds: v.array(v.string()) }, returns: deckResult,
  handler: async (ctx, args) => { requireServer(args.serverSecret); const deck = await owned(ctx, args.id, args.ownerId); if (args.orderedIds.length !== deck.items.length || new Set(args.orderedIds).size !== deck.items.length) throw new ConvexError("The item list changed. Refresh and try again."); const lookup = new Map(deck.items.map((item: any) => [item.id, item])); const items = args.orderedIds.map(id => lookup.get(id)); if (items.some(item => !item)) throw new ConvexError("The item list changed. Refresh and try again."); await ctx.db.patch(deck._id, { items: normalizeItems(items), updatedAt: Date.now() }); return toResult((await ctx.db.get(deck._id))!); },
});
export const importDeck = mutation({
  args: { ownerId: v.string(), serverSecret, deck: deckInput }, returns: deckResult,
  handler: async (ctx, args) => { requireServer(args.serverSecret); const now = Date.now(); const id = await ctx.db.insert("decks", { ...args.deck, ownerId: args.ownerId, items: normalizeItems(args.deck.items), createdAt: now, updatedAt: now }); return toResult((await ctx.db.get(id))!); },
});
