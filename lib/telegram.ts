import type { BookingInput } from "./bookingSchema";

type TelegramBooking = BookingInput & { id: string };

export type TelegramNotificationStatus = "sent" | "skipped" | "failed";

export function isTelegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

export async function sendTelegramBookingNotification(booking: TelegramBooking): Promise<TelegramNotificationStatus> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.info("Telegram booking notification config", {
    hasTelegramBotToken: Boolean(botToken),
    hasTelegramChatId: Boolean(chatId),
  });

  if (!botToken || !chatId) {
    console.warn("Telegram skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.");
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

    console.info("Telegram booking notification response", {
      ok: response.ok,
      status: response.status,
      data,
    });

    if (!response.ok) {
      console.error("Telegram booking notification error", data);
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error("Telegram booking notification failed", error);
    return "failed";
  }
}

function buildTelegramBookingMessage(booking: TelegramBooking) {
  return [
    "<b>New DETAILX Booking</b>",
    "",
    `<b>Name:</b> ${escapeTelegramHtml(booking.name)}`,
    `<b>Phone:</b> ${escapeTelegramHtml(booking.phone)}`,
    `<b>Email:</b> ${escapeTelegramHtml(booking.email)}`,
    `<b>Service:</b> ${escapeTelegramHtml(booking.service)}`,
    `<b>Vehicle:</b> ${escapeTelegramHtml(booking.vehicleType)}`,
    `<b>Price:</b> ${escapeTelegramHtml(booking.estimatedPrice || "Estimate pending")}`,
    `<b>Date:</b> ${escapeTelegramHtml(booking.date)}`,
    `<b>Time:</b> ${escapeTelegramHtml(booking.time)}`,
    `<b>Location:</b> ${escapeTelegramHtml(booking.address)}`,
    `<b>Notes:</b> ${escapeTelegramHtml(booking.notes || "N/A")}`,
  ].join("\n");
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
