import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { convexDecks } from "@/lib/convex-decks";
import { errorResponse,jsonError,jsonOk } from "@/lib/api";
const schema=z.object({orderedIds:z.array(z.string()).min(1)});
export async function POST(request:Request,{params}:{params:Promise<{deckId:string}>}){try{const user=await requireUser();const {deckId}=await params;const deck=await convexDecks.get(deckId,user.id);if(!deck)return jsonError("Deck not found.",404);const parsed=schema.safeParse(await request.json());if(!parsed.success)return jsonError("Invalid order.",422);const existing=(deck.items||[]).map(i=>i.id).sort();if(JSON.stringify(existing)!==JSON.stringify([...parsed.data.orderedIds].sort()))return jsonError("The item list changed. Refresh and try again.",409);return jsonOk(await convexDecks.reorder(deckId,user.id,parsed.data.orderedIds));}catch(error){return errorResponse(error)}}
