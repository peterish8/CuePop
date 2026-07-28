import { NextResponse } from "next/server";
import { AUTH_COOKIE, createLoginSession, hashPassword } from "@/lib/auth";
import { repo } from "@/lib/db";
import { finishGoogleSignIn } from "@/lib/google-auth";

export async function GET(request: Request) {
  try {
    const profile = await finishGoogleSignIn(request);
    const existingUser = repo.findUserByEmail(profile.email);
    const user = existingUser ?? repo.createUser({ name: profile.name, email: profile.email, passwordHash: await hashPassword(`google-oauth-${crypto.randomUUID()}`) });
    const token = await createLoginSession(user);
    const response = NextResponse.redirect(new URL("/workspace", request.url));
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    console.error("Google sign-in failed", error);
    return NextResponse.redirect(new URL("/login?authError=google", request.url));
  }
}
