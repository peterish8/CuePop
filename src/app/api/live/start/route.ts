import { z } from "zod";
import { randomBytes } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { convexDecks } from "@/lib/convex-decks";
import { api } from "../../../../../convex/_generated/api";

const schema = z.object({ deckId: z.string().min(1) });
const publicDomainErrors = new Set([
  "Deck not found.",
  "Add at least one item before starting a session.",
]);

function roomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Choose a valid deck.", 422);
    const deck = await convexDecks.get(parsed.data.deckId, user.id);
    if (!deck) return jsonError("Deck not found.", 404);
    if (!deck.items?.length) return jsonError("Add at least one item before starting a session.", 422);
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    const serverSecret = process.env.CONVEX_SERVER_SECRET;
    if (!url || !serverSecret) throw new Error("Live backend is not configured.");
    const live = new ConvexHttpClient(url);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const room = await live.mutation(api.live.create, {
          code: roomCode(), controllerToken: randomBytes(24).toString("hex"), deckTitle: deck.title,
          waitingMessage: deck.waitingMessage, keepsakeThemes: deck.keepsakeThemes, items: deck.items, serverSecret,
        });
        return jsonOk(room, 201);
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("already in use") || attempt === 2) throw error;
      }
    }
    throw new Error("Could not create a unique room code.");
  } catch (error) {
    if (error instanceof Error && publicDomainErrors.has(error.message)) {
      const status = error.message === "Deck not found." ? 404 : 422;
      return jsonError(error.message, status);
    }
    return errorResponse(error);
  }
}
