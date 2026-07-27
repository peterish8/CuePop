import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof Error && error.message === "UNAUTHORIZED") return jsonError("You need to sign in.", 401);
  console.error(error);
  return jsonError("Something went wrong.", 500);
}
