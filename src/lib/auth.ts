import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { User } from "@/lib/schema";

export const AUTH_COOKIE = "cuepop_session";
const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

type SessionPayload = Pick<User, "id" | "name" | "email" | "plan" | "createdAt"> & { expiresAt: number };

function sessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SESSION_SECRET must be configured with at least 32 characters.");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(user: User, expiresAt = Date.now() + THIRTY_DAYS) {
  const payload: SessionPayload = { ...user, expiresAt };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function readSessionToken(token: string): User | null {
  const [encodedPayload, signature, ...extra] = token.split(".");
  if (!encodedPayload || !signature || extra.length > 0) return null;
  const expectedSignature = sign(encodedPayload);
  const supplied = Buffer.from(signature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<SessionPayload>;
    if (typeof payload.id !== "string" || typeof payload.name !== "string" || typeof payload.email !== "string" ||
      (payload.plan !== "free" && payload.plan !== "pro") || typeof payload.createdAt !== "string" ||
      typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) return null;
    return { id: payload.id, name: payload.name, email: payload.email, plan: payload.plan, createdAt: payload.createdAt };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createLoginSession(user: User) {
  const expiresAt = new Date(Date.now() + THIRTY_DAYS);
  const token = createSessionToken(user, expiresAt.getTime());
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
  store.delete(AUTH_COOKIE);
}

export async function currentUser() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  return token ? readSessionToken(token) : null;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
