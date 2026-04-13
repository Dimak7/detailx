import type { BookingInput } from "./bookingSchema";
import { buildBookingEstimate } from "./pricing";

type TelegramBooking = BookingInput & { id: string };

export type TelegramNotificationStatus = "sent" | "skipped" | "failed";

export async function sendTelegramBookingNotification(booking: TelegramBooking): Promise<TelegramNotificationStatus> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.");
    return "skipped";
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        parse_mode: "HTML",
        text: buildTelegramBookingMessage(booking),
      }),
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error("Telegram booking notification error", {
        status: response.status,
        data,
      });
      return "failed";
    }

    console.info("Telegram booking notification sent", {
      bookingId: booking.id,
      data,
    });
    return "sent";
  } catch (error) {
    console.error("Telegram booking notification failed", error);
    return "failed";
  }
}

function buildTelegramBookingMessage(booking: TelegramBooking) {
  const details = booking.details?.length
    ? booking.details
    : [{ service: booking.service, vehicleType: booking.vehicleType, notes: booking.notes }];
  const estimate = buildBookingEstimate(details);

  return [
    "<b>New DETAILX Booking</b>",
    "",
    `<b>Name:</b> ${escapeTelegramHtml(booking.name)}`,
    `<b>Phone:</b> ${escapeTelegramHtml(booking.phone)}`,
    `<b>Email:</b> ${escapeTelegramHtml(booking.email)}`,
    ...estimate.details.map(
      (detail) =>
        `<b>Detail ${detail.lineNumber}:</b> ${escapeTelegramHtml(detail.service)} / ${escapeTelegramHtml(detail.vehicleType)} / ${escapeTelegramHtml(detail.estimatedPrice)}${detail.discountPercent ? " / 10% off" : ""}`
    ),
    `<b>Total:</b> ${escapeTelegramHtml(booking.estimatedPrice || estimate.estimatedPrice)}`,
    `<b>Date:</b> ${escapeTelegramHtml(booking.date)}`,
    `<b>Time:</b> ${escapeTelegramHtml(booking.time)}`,
    `<b>Location:</b> ${escapeTelegramHtml(booking.address)}`,
    `<b>Notes:</b> ${escapeTelegramHtml(estimate.details.map((detail) => detail.notes).filter(Boolean).join(" | ") || "N/A")}`,
  ].join("\n");
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
