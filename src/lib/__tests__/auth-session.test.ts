import { describe, expect, it } from "vitest";
import { createSessionToken, readSessionToken } from "@/lib/auth";

process.env.AUTH_SESSION_SECRET = "a-test-only-session-secret-that-is-long-enough";

const user = { id: "host-1", name: "Ari", email: "ari@example.com", plan: "free" as const, createdAt: "2026-07-28T00:00:00.000Z" };

describe("signed host sessions", () => {
  it("round-trips a valid signed session", () => {
    expect(readSessionToken(createSessionToken(user))).toEqual(user);
  });

  it("rejects a changed or expired session", () => {
    const token = createSessionToken(user);
    expect(readSessionToken(`${token.slice(0, -1)}x`)).toBeNull();
    expect(readSessionToken(createSessionToken(user, Date.now() - 1))).toBeNull();
  });
});
