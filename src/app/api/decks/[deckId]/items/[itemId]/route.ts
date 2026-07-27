import { requireUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { deckItemPatchSchema, mergedDeckItemState, validateDeckItemState } from "@/lib/deck-validation";
import { deleteStoredMedia } from "@/lib/uploads";

function ownedItem(deckId: string, userId: string, itemId: string) {
  const deck = repo.getDeck(deckId, userId);
  const item = repo.getDeckItem(itemId);
  return deck && item?.deckId === deckId ? item : null;
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

    const parsed = deckItemPatchSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Check the item fields.", 422, parsed.error.flatten());

    const validationError = validateDeckItemState(mergedDeckItemState(current, parsed.data));
    if (validationError) return jsonError(validationError, 422);

    const updated = repo.updateDeckItem(itemId, parsed.data);
    if (updated && parsed.data.imageUrl !== undefined && parsed.data.imageUrl !== current.imageUrl) {
      await deleteStoredMedia(current.imageUrl).catch((error) => console.error("Could not remove replaced slide media", error));
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
    repo.deleteDeckItem(itemId);
    await deleteStoredMedia(item.imageUrl).catch((error) => console.error("Could not remove deleted slide media", error));
    return jsonOk({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
