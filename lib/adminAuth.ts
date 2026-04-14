import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const adminSessionCookie = "detailx_admin_session";

type AdminSession = {
  email: string;
  expiresAt: number;
};

const sessionDays = 7;

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookie)?.value;
  return verifyAdminSessionToken(token);
}

export function validateAdminCredentials(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_SCHEDULE_KEY;

  if (!expectedEmail || !expectedPassword || !getAdminSessionSecret()) {
    return false;
  }

  return email.trim().toLowerCase() === expectedEmail.trim().toLowerCase() && password === expectedPassword;
}

export function createAdminSessionToken(email: string) {
  const expiresAt = Date.now() + sessionDays * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt } satisfies AdminSession)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function setAdminSessionCookie(response: NextResponse, email: string) {
  response.cookies.set(adminSessionCookie, createAdminSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionDays * 24 * 60 * 60,
    path: "/",
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(adminSessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export function isAdminRequest(request: Request) {
  const cookieToken = parseCookieHeader(request.headers.get("cookie")).get(adminSessionCookie);
  if (verifyAdminSessionToken(cookieToken)) {
    return true;
  }

  const legacyKey = process.env.ADMIN_SCHEDULE_KEY;
  return Boolean(legacyKey && request.headers.get("x-admin-key") === legacyKey);
}

export function adminUnauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "Admin access is not configured or the session is invalid.",
    },
    { status: 401 }
  );
}

function verifyAdminSessionToken(token: string | undefined | null): AdminSession | null {
  if (!token || !getAdminSessionSecret()) {
    return null;
  }

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (!session.email || !session.expiresAt || session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function sign(payload: string) {
  return createHmac("sha256", getAdminSessionSecret()).update(payload).digest("base64url");
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_SCHEDULE_KEY || "";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function parseCookieHeader(header: string | null) {
  const cookiesMap = new Map<string, string>();
  if (!header) {
    return cookiesMap;
  }

  header.split(";").forEach((part) => {
    const [name, ...value] = part.trim().split("=");
    if (name) {
      cookiesMap.set(name, decodeURIComponent(value.join("=")));
    }
  });

  return cookiesMap;
}
