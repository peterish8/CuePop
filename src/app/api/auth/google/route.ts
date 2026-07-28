import { NextResponse } from "next/server";
import { startGoogleSignIn } from "@/lib/google-auth";

export async function GET(request: Request) {
  try {
    return NextResponse.redirect(await startGoogleSignIn(request));
  } catch {
    return NextResponse.redirect(new URL("/login?authError=google-unavailable", request.url));
  }
}
