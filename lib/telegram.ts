import type { BookingInput } from "./bookingSchema";
import type { BookingStatus } from "./bookingStore";
import { buildBookingEstimate } from "./pricing";

type TelegramBooking = BookingInput & { id: string; status?: BookingStatus };

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  message?: {
    chat?: {
      id?: number | string;
    };
    message_id?: number;
  };
};

export type TelegramNotificationStatus = "sent" | "skipped" | "failed";
export type TelegramActionResult = {
  ok: boolean;
  message: string;
};

export async function sendTelegramBookingNotification(booking: TelegramBooking): Promise<TelegramNotificationStatus> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.info("Telegram booking notification started", {
    bookingId: booking.id,
    hasBotToken: Boolean(botToken),
    hasChatId: Boolean(chatId),
  });

  if (!botToken || !chatId) {
    console.error("Telegram skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.");
    return "skipped";
  }

  try {
    const response = await telegramApi("sendMessage", {
      chat_id: chatId,
      parse_mode: "HTML",
      text: buildTelegramBookingMessage(booking),
    });

    console.info("Telegram booking notification sent", {
      bookingId: booking.id,
      response,
    });
    return "sent";
  } catch (error) {
    console.error("Telegram booking notification failed", {
      bookingId: booking.id,
      error,
    });
    return "failed";
  }
}

export async function handleTelegramCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<TelegramActionResult> {
  console.info("Telegram action received", {
    callbackQueryId: callbackQuery.id,
    hasData: Boolean(callbackQuery.data),
  });

  await answerTelegramCallback(callbackQuery.id, "Open the DETAILX admin portal to manage bookings.");
  return { ok: true, message: "Telegram booking management is disabled. Use /admin instead." };
}

function buildTelegramBookingMessage(booking: TelegramBooking) {
  const details = booking.details?.length
    ? booking.details
    : [{ service: booking.service, vehicleType: booking.vehicleType, notes: booking.notes }];
  const estimate = buildBookingEstimate(details);
  const notes = estimate.details.map((detail) => detail.notes).filter(Boolean).join(" | ") || booking.notes || "N/A";

  return [
    "<b>New DETAILX Booking</b>",
    "",
    `<b>Booking ID:</b> ${escapeTelegramHtml(booking.id)}`,
    `<b>Name:</b> ${escapeTelegramHtml(booking.name)}`,
    `<b>Phone:</b> ${escapeTelegramHtml(booking.phone)}`,
    `<b>Email:</b> ${escapeTelegramHtml(booking.email)}`,
    `<b>Date:</b> ${escapeTelegramHtml(booking.date)}`,
    `<b>Time:</b> ${escapeTelegramHtml(booking.time)}`,
    `<b>Location:</b> ${escapeTelegramHtml(booking.address)}`,
    "",
    ...estimate.details.flatMap((detail) => [
      `<b>Detail ${detail.lineNumber}</b>`,
      `Service: ${escapeTelegramHtml(detail.service)}`,
      `Vehicle: ${escapeTelegramHtml(detail.vehicleType)}`,
      `Price: ${escapeTelegramHtml(detail.estimatedPrice)}${detail.discountPercent ? " / 10% off" : ""}`,
      "",
    ]),
    `<b>Total:</b> ${escapeTelegramHtml(booking.estimatedPrice || estimate.estimatedPrice)}`,
    `<b>Notes:</b> ${escapeTelegramHtml(notes)}`,
    `<b>Status:</b> ${formatStatus(booking.status || "pending")}`,
    `<b>Admin:</b> ${escapeTelegramHtml(buildAdminBookingUrl(booking))}`,
  ].join("\n");
}

function buildAdminBookingUrl(booking: TelegramBooking) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://detailxchicago.com").replace(/\/$/, "");
  return `${siteUrl}/admin/bookings?search=${encodeURIComponent(booking.email)}`;
}

async function answerTelegramCallback(callbackQueryId: string, text: string) {
  try {
    await telegramApi("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    });
  } catch (error) {
    console.error("Telegram answerCallbackQuery failed", error);
  }
}

async function telegramApi(method: string, payload: Record<string, unknown>) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  }

  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(`Telegram ${method} failed with ${response.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

function formatStatus(status: BookingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function escapeTelegramHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
