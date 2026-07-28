import { z } from "zod";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";
import { authenticateRemoteAccess, setRemotePassword } from "@/lib/live/service";

const passwordSchema = z.object({ password: z.string().min(4).max(100) });
const setSchema = passwordSchema.extend({ token: z.string().min(32) });

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const parsed = passwordSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Enter a password with at least 4 characters.", 422);
    const { code } = await params;
    return jsonOk(await authenticateRemoteAccess(code.toUpperCase(), parsed.data.password));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const parsed = setSchema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Enter a password with at least 4 characters.", 422);
    const { code } = await params;
    return jsonOk(await setRemotePassword(code.toUpperCase(), parsed.data.token, parsed.data.password));
  } catch (error) {
    return errorResponse(error);
  }
}
