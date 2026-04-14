import { NextResponse } from "next/server";
import { setAdminSessionCookie, validateAdminCredentials } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!validateAdminCredentials(email, password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL("/admin/dashboard", request.url), { status: 303 });
  setAdminSessionCookie(response, email);
  return response;
}
