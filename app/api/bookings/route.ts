import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { assertFutureDate, bookingSchema } from "@/lib/bookingSchema";
import { saveBooking } from "@/lib/bookingStore";
import { sendBookingNotifications } from "@/lib/notifications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const booking = bookingSchema.parse(body);
    assertFutureDate(booking.date);

    const savedBooking = await saveBooking(booking);
    const notifications = await sendBookingNotifications(savedBooking);
    const emailWarning =
      notifications.email === "skipped"
        ? "Booking saved. Email confirmations were skipped because email is not configured."
        : notifications.email === "failed"
          ? "Booking saved. Email confirmations could not be sent."
          : null;

    return NextResponse.json(
      {
        ok: true,
        bookingId: savedBooking.id,
        notifications,
        warning: emailWarning,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: error.issues[0]?.message || "Invalid booking details.",
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Choose a future booking date.") {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    console.error("Booking request failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "We could not save the booking request. Please try again.",
      },
      { status: 500 }
    );
  }
}
