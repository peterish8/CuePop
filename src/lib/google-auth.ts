import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "node:crypto";

export const GOOGLE_OAUTH_STATE_COOKIE = "cuepop_google_oauth_state";
const STATE_MAX_AGE_SECONDS = 10 * 60;

function googleClientId() {
  const value = process.env.GOOGLE_CLIENT_ID;
  if (!value) throw new Error("Google sign-in is not configured.");
  return value;
}

function googleClientSecret() {
  const value = process.env.GOOGLE_CLIENT_SECRET;
  if (!value) throw new Error("Google sign-in is not configured.");
  return value;
}

export async function startGoogleSignIn(request: Request) {
  const state = randomBytes(32).toString("base64url");
  const store = await cookies();
  store.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: STATE_MAX_AGE_SECONDS,
  });

  const callbackUrl = new URL("/api/auth/callback/google", request.url).toString();
  const authorizeUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorizeUrl.searchParams.set("client_id", googleClientId());
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", "openid email profile");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("prompt", "select_account");
  return authorizeUrl.toString();
}

export async function finishGoogleSignIn(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const store = await cookies();
  const expectedState = store.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  store.delete(GOOGLE_OAUTH_STATE_COOKIE);

  if (!state || !code || !expectedState || state.length !== expectedState.length || !timingSafeEqual(Buffer.from(state), Buffer.from(expectedState))) {
    throw new Error("Your Google sign-in session expired. Please try again.");
  }

  const callbackUrl = new URL("/api/auth/callback/google", request.url).toString();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: googleClientId(),
      client_secret: googleClientSecret(),
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) throw new Error("Google could not verify the sign-in. Please try again.");
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) throw new Error("Google did not return an access token.");

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!profileResponse.ok) throw new Error("Google could not load your account details.");
  const profile = await profileResponse.json() as { sub?: string; email?: string; email_verified?: boolean; name?: string; given_name?: string };
  if (!profile.sub || !profile.email || profile.email_verified !== true) throw new Error("Please choose a Google account with a verified email address.");

  return {
    subject: profile.sub,
    email: profile.email.toLowerCase(),
    name: (profile.name || profile.given_name || profile.email.split("@")[0]).trim().slice(0, 80),
  };
}
