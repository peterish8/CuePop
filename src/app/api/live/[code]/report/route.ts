import { jsonError, jsonOk } from "@/lib/api";
import { getReport } from "@/lib/live/service";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get("token");
  const response = (() => {
    if (!token) return jsonError("Presenter token required.", 401);
    try {
      return jsonOk(getReport(code.toUpperCase(), token));
    } catch (error) {
      return jsonError(error instanceof Error ? error.message : "Could not load report.", 403);
    }
  })();
  response.headers.set("Cache-Control", "no-store");
  return response;
}
