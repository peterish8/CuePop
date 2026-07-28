import { requireUser } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { repo } from "@/lib/db";
import { createDeckTransfer } from "@/lib/deck-transfer";

export async function GET(_: Request, { params }: { params: Promise<{ deckId: string }> }) {
  const user = await requireUser(); const { deckId } = await params; const deck = repo.getDeck(deckId, user.id);
  if (!deck) return jsonError("Deck not found.", 404);
  const slug = deck.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "cuepop-deck";
  return new Response(JSON.stringify(createDeckTransfer(deck), null, 2), { headers: { "content-type": "application/json", "content-disposition": `attachment; filename="${slug}.cuepop.json"`, "cache-control": "no-store" } });
}
