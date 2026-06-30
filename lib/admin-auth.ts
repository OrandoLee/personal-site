import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { uiText } from "@/content/uiText";

export const adminCookieName = "creator_admin_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 7;

export type AdminSession = {
  username: string;
  expiresAt: number;
};

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "development-admin-session-secret";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function signaturesMatch(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return (
    aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer)
  );
}

export function createAdminSessionToken(username: string) {
  const payload: AdminSession = {
    username,
    expiresAt: Date.now() + sessionMaxAgeSeconds * 1000
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminSessionToken(token?: string) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature || !signaturesMatch(sign(encodedPayload), signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as AdminSession;

    if (!payload.username || payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getAdminSession() {
  return verifyAdminSessionToken(cookies().get(adminCookieName)?.value);
}

export function requireAdminPage(returnPath?: string) {
  const session = getAdminSession();

  if (!session) {
    const loginUrl =
      returnPath && returnPath.startsWith("/") && !returnPath.startsWith("//")
        ? `/login?next=${encodeURIComponent(returnPath)}`
        : "/login";
    redirect(loginUrl);
  }

  return session;
}

export function requireGuestLoginPage(destination = "/dashboard") {
  const session = getAdminSession();

  if (session) {
    redirect(destination);
  }
}

export function requireAdminApi() {
  return getAdminSession();
}

export function unauthorizedJson() {
  return NextResponse.json(
    { ok: false, message: uiText.apiMessages.unauthorized },
    { status: 401 }
  );
}

export function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(adminCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds
  });
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(adminCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
