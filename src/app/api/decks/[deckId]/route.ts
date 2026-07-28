import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { getDb, repo } from "@/lib/db";
import { deleteStoredMediaIfUnused } from "@/lib/uploads";

const keepsakeThemeSchema = z.enum(["signal", "midnight", "paper"]);
const patchSchema = z
  .object({
    title: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(400).optional(),
    waitingMessage: z.string().trim().min(2).max(180).optional(),
    keepsakeThemes: z.array(keepsakeThemeSchema).min(1).max(3).optional(),
  })
  .strict();

export async function GET(_: Request, { params }: { params: Promise<{ deckId: string }> }) {
  try {
    const user = await requireUser();
    const { deckId } = await params;
    const deck = repo.getDeck(deckId, user.id);
    return deck ? jsonOk(deck) : jsonError("Deck not found.", 404);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ deckId: string }> }) {
  try {
    const user = await requireUser();
    const { deckId } = await params;
    const parsed = patchSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Some deck details are invalid.", 422, parsed.error.flatten());
    const deck = repo.updateDeck(deckId, user.id, parsed.data);
    return deck ? jsonOk(deck) : jsonError("Deck not found.", 404);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ deckId: string }> }) {
  try {
    const user = await requireUser();
    const { deckId } = await params;
    const deck = repo.getDeck(deckId, user.id);
    if (!deck) return jsonError("Deck not found.", 404);
    const activeSession = getDb().prepare("SELECT id FROM live_sessions WHERE deck_id=? AND status <> 'ended' LIMIT 1").get(deckId);
    if (activeSession) return jsonError("End this live session before deleting its deck.", 409);
    // A question background can be reused by several moments, so collect all
    // deck-owned media once before deleting the deck and its item rows.
    const mediaUrls = [...new Set((deck.items || []).flatMap((item) => [item.imageUrl, item.backgroundImageUrl]).filter((url): url is string => Boolean(url)))];
    repo.deleteDeck(deckId, user.id);
    await Promise.allSettled(mediaUrls.map((url) => deleteStoredMediaIfUnused(url)));
    return jsonOk({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
