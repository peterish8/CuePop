import { NextResponse } from "next/server";
import { AUTH_COOKIE, createLoginSession } from "@/lib/auth";
import { finishGoogleSignIn } from "@/lib/google-auth";

export async function GET(request: Request) {
  try {
    const profile = await finishGoogleSignIn(request);
    const token = await createLoginSession({
      id: `google_${profile.subject}`,
      name: profile.name,
      email: profile.email,
      plan: "free",
      createdAt: new Date().toISOString(),
    });
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
