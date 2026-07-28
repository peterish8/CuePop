import { jsonOk } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  return jsonOk({ status: "ok", service: "deckactive", time: new Date().toISOString() });
}
