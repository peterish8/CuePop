import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { createLiveSession } from "@/lib/live/service";

const schema = z.object({ deckId: z.string().min(1) });
const publicDomainErrors = new Set([
  "Deck not found.",
  "Add at least one item before starting a session.",
  "Host account not found.",
  "The free plan includes three live sessions per month.",
]);

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Choose a valid deck.", 422);
    return jsonOk(createLiveSession(parsed.data.deckId, user.id), 201);
  } catch (error) {
    if (error instanceof Error && publicDomainErrors.has(error.message)) {
      const status = error.message === "Deck not found." ? 404 : 422;
      return jsonError(error.message, status);
    }
    return errorResponse(error);
  }
}
