import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { repo } from "@/lib/db";
import { errorResponse,jsonError,jsonOk } from "@/lib/api";
const schema=z.object({orderedIds:z.array(z.string()).min(1)});
export async function POST(request:Request,{params}:{params:Promise<{deckId:string}>}){try{const user=await requireUser();const {deckId}=await params;if(!repo.getDeck(deckId,user.id))return jsonError("Deck not found.",404);const parsed=schema.safeParse(await request.json());if(!parsed.success)return jsonError("Invalid order.",422);const existing=repo.listDeckItems(deckId).map(i=>i.id).sort();if(JSON.stringify(existing)!==JSON.stringify([...parsed.data.orderedIds].sort()))return jsonError("The item list changed. Refresh and try again.",409);return jsonOk(repo.reorderDeckItems(deckId,parsed.data.orderedIds));}catch(error){return errorResponse(error)}}
