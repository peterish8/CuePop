import { requireUser } from "@/lib/auth";
import { getDb, repo } from "@/lib/db";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { deckItemPatchSchema, mergedDeckItemState, validateDeckItemState } from "@/lib/deck-validation";
import { deleteStoredMediaIfUnused } from "@/lib/uploads";

function ownedItem(deckId: string, userId: string, itemId: string) {
  const deck = repo.getDeck(deckId, userId);
  const item = repo.getDeckItem(itemId);
  return deck && item?.deckId === deckId ? item : null;
}

function itemIsLive(deckId: string, itemId: string) {
  return Boolean(getDb().prepare("SELECT id FROM live_sessions WHERE deck_id=? AND current_item_id=? AND status NOT IN ('join','ended') LIMIT 1").get(deckId, itemId));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ deckId: string; itemId: string }> },
) {
  try {
    const user = await requireUser();
    const { deckId, itemId } = await params;
    const current = ownedItem(deckId, user.id, itemId);
    if (!current) return jsonError("Item not found.", 404);
    if (itemIsLive(deckId, itemId)) return jsonError("This item is live right now. Move the room forward or end the session before editing it.", 409);

    const parsed = deckItemPatchSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Check the item fields.", 422, parsed.error.flatten());

    const validationError = validateDeckItemState(mergedDeckItemState(current, parsed.data));
    if (validationError) return jsonError(validationError, 422);

    const updated = repo.updateDeckItem(itemId, parsed.data);
    if (updated) {
      const replacedMedia = [
        parsed.data.imageUrl !== undefined && parsed.data.imageUrl !== current.imageUrl ? current.imageUrl : null,
        parsed.data.backgroundImageUrl !== undefined && parsed.data.backgroundImageUrl !== current.backgroundImageUrl ? current.backgroundImageUrl : null,
      ];
      await Promise.allSettled(replacedMedia.map((url) => deleteStoredMediaIfUnused(url)));
    }
    return jsonOk(updated);
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
    const item = ownedItem(deckId, user.id, itemId);
    if (!item) return jsonError("Item not found.", 404);
    if (itemIsLive(deckId, itemId)) return jsonError("This item is live right now. Move the room forward or end the session before removing it.", 409);
    repo.deleteDeckItem(itemId);
    await Promise.allSettled([item.imageUrl, item.backgroundImageUrl].map((url) => deleteStoredMediaIfUnused(url)));
    return jsonOk({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
