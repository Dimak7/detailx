import { NextResponse } from "next/server";

export function isAdminRequest(request: Request) {
  const expected = process.env.ADMIN_SCHEDULE_KEY;

  if (!expected) {
    console.error("Admin schedule access skipped: ADMIN_SCHEDULE_KEY is not configured.");
    return false;
  }

  return request.headers.get("x-admin-key") === expected;
}

export function adminUnauthorizedResponse() {
  return NextResponse.json(
    {
      ok: false,
      error: "Admin access is not configured or the password is incorrect.",
    },
    { status: 401 }
  );
}
