import { handleBookingRequest } from "@/lib/bookingRequest";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  console.info("Legacy booking route request context", {
    host: request.headers.get("host"),
    nextUrlOrigin: request.nextUrl.origin,
  });

  return handleBookingRequest(request);
}
