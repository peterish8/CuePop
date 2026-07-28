import { z } from "zod";
import { createLoginSession, verifyPassword } from "@/lib/auth";
import { repo } from "@/lib/db";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";

const schema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Enter a valid email and password.", 422);
    const user = repo.findUserByEmail(parsed.data.email);
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return jsonError("Email or password is incorrect.", 401);
    const { passwordHash: _, ...safeUser } = user;
    await createLoginSession(safeUser);
    return jsonOk(safeUser);
  } catch (error) { return errorResponse(error); }
}
