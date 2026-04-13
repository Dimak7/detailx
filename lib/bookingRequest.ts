import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { assertFutureDate, bookingSchema } from "./bookingSchema";
import { saveBooking } from "./bookingStore";
import { sendBookingNotifications } from "./notifications";
import { getEstimatedPrice } from "./pricing";

export async function handleBookingRequest(request: Request) {
  try {
    logBookingRequestHost(request);
    const body = await request.json();
    const booking = bookingSchema.parse(body);
    assertFutureDate(booking.date);
    const pricedBooking = {
      ...booking,
      estimatedPrice: getEstimatedPrice(booking.service, booking.vehicleType),
    };

    const savedBooking = await saveBooking(pricedBooking);
    const notifications = await sendBookingNotifications(savedBooking);
    const telegram = "skipped";
    console.info("Telegram notification temporarily disabled for booking isolation test.", {
      bookingId: savedBooking.id,
    });
    const emailWarning =
      notifications.email === "skipped"
        ? "Booking saved. Email confirmations were skipped because Resend is not configured."
        : notifications.email === "failed"
          ? "Booking saved. Email confirmations could not be sent."
          : null;
    const telegramWarning =
      telegram === "skipped"
        ? "Telegram notification was skipped because Telegram is not configured."
        : telegram === "failed"
          ? "Telegram notification could not be sent."
          : null;
    const bookingStatus =
      notifications.email === "sent" && telegram === "sent"
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
        telegramSent: telegram === "sent",
        estimatedPrice: savedBooking.estimatedPrice,
        notifications: {
          ...notifications,
          telegram,
        },
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

function logBookingRequestHost(request: Request) {
  let urlOrigin = "unknown";

  try {
    urlOrigin = new URL(request.url).origin;
  } catch {
    urlOrigin = "invalid_request_url";
  }

  console.info("Booking request host context", {
    host: request.headers.get("host"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    urlOrigin,
  });
}
