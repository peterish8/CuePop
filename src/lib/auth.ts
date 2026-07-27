import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { repo } from "@/lib/db";

export const AUTH_COOKIE = "cuepop_session";
const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createLoginSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + THIRTY_DAYS);
  repo.createAuthSession(userId, token, expiresAt.toISOString());
  const store = await cookies();
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function clearLoginSession() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (token) repo.deleteAuthSession(token);
  store.delete(AUTH_COOKIE);
}

export async function currentUser() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  return token ? repo.findUserBySession(token) : null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
