import { z } from "zod";
import { createLoginSession, hashPassword } from "@/lib/auth";
import { repo } from "@/lib/db";
import { errorResponse, jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(180),
  password: z.string().min(8).max(100),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Check your name, email and password.", 422, parsed.error.flatten());
    if (repo.findUserByEmail(parsed.data.email)) return jsonError("An account already exists for this email.", 409);
    const passwordHash = await hashPassword(parsed.data.password);
    const user = repo.createUser({ ...parsed.data, passwordHash });
    await createLoginSession(user);
    return jsonOk(user, 201);
  } catch (error) { return errorResponse(error); }
}
