import { currentUser } from "@/lib/auth";
import { jsonOk } from "@/lib/api";

export async function GET() {
  const response = jsonOk(await currentUser());
  response.headers.set("Cache-Control", "no-store");
  return response;
}
