import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { User } from "@/lib/schema";

type StoredUser = User & { passwordHash?: string; createdAt: number | string };
function client() { const url = process.env.NEXT_PUBLIC_CONVEX_URL; const secret = process.env.CONVEX_SERVER_SECRET; if (!url || !secret) throw new Error("Deckactive storage is not configured."); return { convex: new ConvexHttpClient(url), secret }; }
function map(user: StoredUser): User & { passwordHash?: string } { return { ...user, createdAt: typeof user.createdAt === "number" ? new Date(user.createdAt).toISOString() : user.createdAt }; }
export const convexUsers = {
  async findByEmail(email: string) { const { convex, secret } = client(); const user = await convex.query(api.users.findByEmail, { email: email.toLowerCase(), serverSecret: secret }); return user ? map(user) : null; },
  async upsert(input: { id: string; name: string; email: string; passwordHash?: string }) { const { convex, secret } = client(); return map(await convex.mutation(api.users.upsert, { ...input, email: input.email.toLowerCase(), serverSecret: secret })); },
};
