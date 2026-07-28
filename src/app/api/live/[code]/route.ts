import { ConvexHttpClient } from "convex/browser";
import { jsonError, jsonOk } from "@/lib/api";
import { api } from "../../../../../convex/_generated/api";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get("token");
  const remoteToken = new URL(request.url).searchParams.get("remoteToken");
  try {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("Live backend is not configured.");
    const client = new ConvexHttpClient(url);
    const response = token
      ? jsonOk(await client.query(api.live.hostRoom, { code: code.toUpperCase(), token }))
      : remoteToken
        ? jsonOk(await client.query(api.live.remoteRoom, { code: code.toUpperCase(), token: remoteToken }))
        : (() => jsonError("Use the realtime room connection.", 409))();
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const response = jsonError(error instanceof Error ? error.message : "Room not found.", 403);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
