import { jsonError, jsonOk } from "@/lib/api";
import { getHostRoom, getRoomSnapshot } from "@/lib/live/service";

export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const token = new URL(request.url).searchParams.get("token");
  try {
    const response = token
      ? jsonOk(getHostRoom(code.toUpperCase(), token))
      : (() => {
          const snapshot = getRoomSnapshot(code.toUpperCase());
          return snapshot ? jsonOk(snapshot) : jsonError("Room not found.", 404);
        })();
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    const response = jsonError(error instanceof Error ? error.message : "Room not found.", 403);
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
}
