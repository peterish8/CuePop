import { NextResponse } from "next/server";
import { createLoginSession, hashPassword } from "@/lib/auth";
import { repo } from "@/lib/db";
import { finishGoogleSignIn } from "@/lib/google-auth";

export async function GET(request: Request) {
  try {
    const profile = await finishGoogleSignIn(request);
    const existingUser = repo.findUserByEmail(profile.email);
    const user = existingUser ?? repo.createUser({
      name: profile.name,
      email: profile.email,
      passwordHash: await hashPassword(`google-oauth-${crypto.randomUUID()}`),
    });
    await createLoginSession(user);
    return NextResponse.redirect(new URL("/workspace", request.url));
  } catch (error) {
    console.error("Google sign-in failed", error);
    return NextResponse.redirect(new URL("/login?authError=google", request.url));
  }
}
