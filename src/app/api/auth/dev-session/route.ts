import { NextResponse } from "next/server";
import { createLoginSession } from "@/lib/auth";

export async function POST(request: Request) {
  const hostname = new URL(request.url).hostname;
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

  if (process.env.NODE_ENV !== "development" || !isLocalhost) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  process.env.AUTH_SESSION_SECRET ??= "deckactive-local-development-session-secret-only";

  const user = {
    id: "local-development-host",
    name: "Local host",
    email: "local@deckactive.test",
    plan: "free" as const,
    createdAt: new Date(0).toISOString(),
  };

  await createLoginSession(user);
  return NextResponse.json({ data: user });
}
