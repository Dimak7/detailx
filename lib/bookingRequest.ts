import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { assertFutureDate, bookingSchema } from "./bookingSchema";
import { saveBooking } from "./bookingStore";
import { sendBookingNotifications } from "./notifications";
import { getEstimatedPrice } from "./pricing";

export async function handleBookingRequest(request: Request) {
  try {
    const body = await request.json();
    const booking = bookingSchema.parse(body);
    assertFutureDate(booking.date);
    const pricedBooking = {
      ...booking,
      estimatedPrice: getEstimatedPrice(booking.service, booking.vehicleType),
    };

    const savedBooking = await saveBooking(pricedBooking);
    const notifications = await sendBookingNotifications(savedBooking);
    const emailWarning =
      notifications.email === "skipped"
        ? "Booking saved. Email confirmations were skipped because Resend is not configured."
        : notifications.email === "failed"
          ? "Booking saved. Email confirmations could not be sent."
          : null;
    const telegramWarning =
      notifications.telegram === "skipped"
        ? "Telegram notification was skipped because Telegram is not configured."
        : notifications.telegram === "failed"
          ? "Telegram notification could not be sent."
          : null;
    const bookingStatus =
      notifications.email === "sent" && notifications.telegram === "sent"
        ? "booking_saved_email_telegram_sent"
        : notifications.email === "sent"
          ? "booking_saved_email_sent"
          : notifications.email === "failed"
            ? "booking_saved_email_failed"
            : "booking_saved_email_skipped";

    return NextResponse.json(
      {
        ok: true,
        status: bookingStatus,
        bookingId: savedBooking.id,
        emailSent: notifications.email === "sent",
        telegramSent: notifications.telegram === "sent",
        estimatedPrice: savedBooking.estimatedPrice,
        notifications,
        warning: [emailWarning, telegramWarning].filter(Boolean).join(" "),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          ok: false,
          status: "booking_failed",
          error: error.issues[0]?.message || "Invalid booking details.",
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message === "Choose a future booking date.") {
      return NextResponse.json({ ok: false, status: "booking_failed", error: error.message }, { status: 400 });
    }

    console.error("Booking request failed", error);
    return NextResponse.json(
      {
        ok: false,
        status: "booking_failed",
        error: "We could not save the booking request. Please try again.",
      },
      { status: 500 }
    );
  }
}
