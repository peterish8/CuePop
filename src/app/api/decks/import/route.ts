import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { repo } from "@/lib/db";
import { parseDeckTransfer } from "@/lib/deck-transfer";

export async function POST(request: Request) {
  try {
    const user = await requireUser(); const parsed = parseDeckTransfer(await request.json());
    if (!parsed.success) return jsonError("This is not a valid CuePop deck export.", 422, parsed.error.flatten());
    const source = parsed.data.deck; const deck = repo.createDeck(user.id, { title: source.title, description: source.description });
    repo.updateDeck(deck.id, user.id, { waitingMessage: source.waitingMessage, keepsakeThemes: source.keepsakeThemes });
    source.items.forEach((item) => repo.createDeckItem(deck.id, item));
    return jsonOk(repo.getDeck(deck.id, user.id), 201);
  } catch (error) { return errorResponse(error); }
}
