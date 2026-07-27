import { getDb } from "@/lib/db";
import { jsonOk } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  getDb().prepare("SELECT 1 AS healthy").get();
  return jsonOk({ status: "ok", service: "cuepop", time: new Date().toISOString() });
}
