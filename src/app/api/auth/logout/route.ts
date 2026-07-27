import { clearLoginSession } from "@/lib/auth";
import { jsonOk } from "@/lib/api";
export async function POST() { await clearLoginSession(); return jsonOk({ loggedOut: true }); }
