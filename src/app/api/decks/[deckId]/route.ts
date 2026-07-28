import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { convexDecks } from "@/lib/convex-decks";

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
    const deck = await convexDecks.get(deckId, user.id);
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
    const exists = await convexDecks.get(deckId, user.id);
    if (!exists) return jsonError("Deck not found.", 404);
    return jsonOk(await convexDecks.update(deckId, user.id, parsed.data));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ deckId: string }> }) {
  try {
    const user = await requireUser();
    const { deckId } = await params;
    const deck = await convexDecks.get(deckId, user.id);
    if (!deck) return jsonError("Deck not found.", 404);
    await convexDecks.remove(deckId, user.id);
    return jsonOk({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
