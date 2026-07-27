import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";

const createSchema = z.object({ title: z.string().trim().min(2).max(100), description: z.string().trim().max(300).optional() });

export async function GET() {
  try { const user = await requireUser(); return jsonOk(repo.listDecks(user.id)); }
  catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Give the deck a short title.", 422);
    return jsonOk(repo.createDeck(user.id, parsed.data), 201);
  } catch (error) { return errorResponse(error); }
}
