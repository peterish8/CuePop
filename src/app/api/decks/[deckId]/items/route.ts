import { requireUser } from "@/lib/auth";
import { nanoid } from "nanoid";
import { convexDecks } from "@/lib/convex-decks";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { deckItemCreateSchema, validateDeckItemState } from "@/lib/deck-validation";

export async function POST(request: Request, { params }: { params: Promise<{ deckId: string }> }) {
  try {
    const user = await requireUser();
    const { deckId } = await params;
    if (!await convexDecks.get(deckId, user.id)) return jsonError("Deck not found.", 404);

    const parsed = deckItemCreateSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Check this slide or moment.", 422, parsed.error.flatten());

    const validationError = validateDeckItemState(parsed.data);
    if (validationError) return jsonError(validationError, 422);

    return jsonOk(await convexDecks.addItem(deckId, user.id, { ...parsed.data, id: nanoid() }), 201);
  } catch (error) {
    return errorResponse(error);
  }
}
