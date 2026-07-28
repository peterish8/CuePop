import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { convexDecks } from "@/lib/convex-decks";
import { parseDeckTransfer } from "@/lib/deck-transfer";

export async function POST(request: Request) {
  try {
    const user = await requireUser(); const parsed = parseDeckTransfer(await request.json());
    if (!parsed.success) return jsonError("This is not a valid CuePop deck export.", 422, parsed.error.flatten());
    const source = parsed.data.deck;
    return jsonOk(await convexDecks.import(user.id, { ...source, items: source.items.map((item, position) => ({ id: crypto.randomUUID(), deckId: "", position, type: item.type, title: item.title, imageUrl: item.imageUrl ?? null, backgroundImageUrl: item.backgroundImageUrl ?? null, backgroundBlur: item.backgroundBlur ?? 0, backgroundIntensity: item.backgroundIntensity ?? 64, question: item.question ?? null, options: item.options ?? [], notes: item.notes ?? null, revealMode: item.revealMode ?? "manual", createdAt: "", updatedAt: "" })) }), 201);
  } catch (error) { return errorResponse(error); }
}
