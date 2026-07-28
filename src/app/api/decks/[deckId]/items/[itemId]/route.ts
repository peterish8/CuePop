import { requireUser } from "@/lib/auth";
import { convexDecks } from "@/lib/convex-decks";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { deckItemPatchSchema, mergedDeckItemState, validateDeckItemState } from "@/lib/deck-validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ deckId: string; itemId: string }> },
) {
  try {
    const user = await requireUser();
    const { deckId, itemId } = await params;
    const deck = await convexDecks.get(deckId, user.id);
    const current = deck?.items?.find((item) => item.id === itemId) ?? null;
    if (!current) return jsonError("Item not found.", 404);

    const parsed = deckItemPatchSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Check the item fields.", 422, parsed.error.flatten());

    const validationError = validateDeckItemState(mergedDeckItemState(current, parsed.data));
    if (validationError) return jsonError(validationError, 422);

    return jsonOk(await convexDecks.patchItem(deckId, user.id, { ...current, ...parsed.data }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ deckId: string; itemId: string }> },
) {
  try {
    const user = await requireUser();
    const { deckId, itemId } = await params;
    const deck = await convexDecks.get(deckId, user.id);
    const item = deck?.items?.find((entry) => entry.id === itemId) ?? null;
    if (!item) return jsonError("Item not found.", 404);
    await convexDecks.deleteItem(deckId, user.id, itemId);
    return jsonOk({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
