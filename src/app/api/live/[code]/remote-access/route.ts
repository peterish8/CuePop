import { z } from "zod";
import { ConvexHttpClient } from "convex/browser";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { api } from "../../../../../../convex/_generated/api";

const passwordSchema = z.object({ password: z.string().min(4).max(100) });
const setSchema = passwordSchema.extend({ token: z.string().min(32) });

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const parsed = passwordSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Enter a password with at least 4 characters.", 422);
    const { code } = await params;
    const url = process.env.NEXT_PUBLIC_CONVEX_URL; if (!url) throw new Error("Live backend is not configured.");
    return jsonOk(await new ConvexHttpClient(url).mutation(api.live.unlockRemote, { code: code.toUpperCase(), password: parsed.data.password }));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const parsed = setSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Enter a password with at least 4 characters.", 422);
    const { code } = await params;
    const url = process.env.NEXT_PUBLIC_CONVEX_URL; if (!url) throw new Error("Live backend is not configured.");
    return jsonOk(await new ConvexHttpClient(url).mutation(api.live.setRemotePassword, { code: code.toUpperCase(), token: parsed.data.token, password: parsed.data.password }));
  } catch (error) {
    return errorResponse(error);
  }
}
