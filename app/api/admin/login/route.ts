import { NextResponse } from "next/server";
import { getAdminAuthConfigStatus, setAdminSessionCookie, validateAdminCredentials } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const config = getAdminAuthConfigStatus();
    if (!config.configured) {
      console.error("Admin login route rejected missing configuration.", { missing: config.missing });
      return NextResponse.redirect(new URL("/admin/login?error=config", request.url), { status: 303 });
    }

    const formData = await request.formData();
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    if (!validateAdminCredentials(email, password)) {
      return NextResponse.redirect(new URL("/admin/login?error=1", request.url), { status: 303 });
    }

    const response = NextResponse.redirect(new URL("/admin/dashboard", request.url), { status: 303 });
    setAdminSessionCookie(response, email);
    console.info("Admin login succeeded", { email: email.trim().toLowerCase() });
    return response;
  } catch (error) {
    console.error("Admin login failed safely.", { error });
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url), { status: 303 });
  }
}
