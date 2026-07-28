import { ConvexHttpClient } from "convex/browser";
import { jsonError, jsonOk } from "@/lib/api";
import { api } from "../../../../../../convex/_generated/api";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get("token");
  const response = (() => {
    if (!token) return jsonError("Presenter token required.", 401);
    try {
      const url = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (!url) throw new Error("Live backend is not configured.");
      return jsonOk(await new ConvexHttpClient(url).query(api.live.report, { code: code.toUpperCase(), token }));
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : "Could not load report.", 403);
    }
  })();
  response.headers.set("Cache-Control", "no-store");
  return response;
}
