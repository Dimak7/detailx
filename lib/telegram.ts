import type { BookingInput } from "./bookingSchema";
import { getBookingById, updateBookingStatus, type BookingStatus } from "./bookingStore";
import { buildBookingEstimate } from "./pricing";
import { sendCustomerBookingConfirmation } from "./resend";

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

const telegramActions = ["confirm", "cancel", "resend", "complete"] as const;
type TelegramAction = (typeof telegramActions)[number];

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
      reply_markup: buildTelegramKeyboard(booking.id, booking.status || "pending"),
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

  if (!isAllowedTelegramChat(callbackQuery)) {
    await answerTelegramCallback(callbackQuery.id, "Unauthorized Telegram chat.");
    return { ok: false, message: "Unauthorized Telegram chat." };
  }

  const parsed = parseTelegramCallbackData(callbackQuery.data || "");

  if (!parsed) {
    await answerTelegramCallback(callbackQuery.id, "Invalid booking action.");
    return { ok: false, message: "Invalid booking action." };
  }

  try {
    const result = await runTelegramBookingAction(parsed.bookingId, parsed.action);
    await answerTelegramCallback(callbackQuery.id, result.message);
    await sendTelegramActionFollowup(parsed.bookingId, result.message);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Telegram action failed.";
    console.error("Telegram booking action failed", {
      bookingId: parsed.bookingId,
      action: parsed.action,
      error,
    });
    await answerTelegramCallback(callbackQuery.id, message);
    return { ok: false, message };
  }
}

export async function runTelegramBookingAction(bookingId: string, action: TelegramAction): Promise<TelegramActionResult> {
  const booking = await getBookingById(bookingId);

  if (!booking) {
    return { ok: false, message: "Booking was not found." };
  }

  if (action === "resend") {
    console.info("Telegram resend email started", { bookingId });
    try {
      await sendCustomerBookingConfirmation(booking);
      console.info("Telegram resend email success", { bookingId });
      return { ok: true, message: `Confirmation email resent for ${booking.name}.` };
    } catch (error) {
      console.error("Telegram resend email failed", { bookingId, error });
      return { ok: false, message: "Confirmation email could not be resent." };
    }
  }

  const nextStatus = getStatusForTelegramAction(action);

  if (!nextStatus) {
    return { ok: false, message: "Invalid booking action." };
  }

  await updateBookingStatus(bookingId, nextStatus);
  console.info("Telegram booking status updated", {
    bookingId,
    action,
    status: nextStatus,
  });

  return {
    ok: true,
    message: `Booking ${bookingId} marked ${nextStatus}.`,
  };
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
  ].join("\n");
}

function buildTelegramKeyboard(bookingId: string, status: BookingStatus) {
  if (status === "cancelled" || status === "completed") {
    return {
      inline_keyboard: [[button("Resend Email", "resend", bookingId)]],
    };
  }

  if (status === "pending") {
    return {
      inline_keyboard: [
        [button("Confirm Booking", "confirm", bookingId), button("Cancel Booking", "cancel", bookingId)],
        [button("Resend Email", "resend", bookingId)],
      ],
    };
  }

  return {
    inline_keyboard: [
      [button("Cancel Booking", "cancel", bookingId)],
      [button("Resend Email", "resend", bookingId), button("Mark Complete", "complete", bookingId)],
    ],
  };
}

function button(label: string, action: TelegramAction, bookingId: string) {
  return {
    text: label,
    callback_data: `detailx:${action}:${bookingId}`,
  };
}

function parseTelegramCallbackData(data: string) {
  const [namespace, action, bookingId] = data.split(":");

  if (namespace !== "detailx" || !telegramActions.includes(action as TelegramAction) || !bookingId) {
    return null;
  }

  return {
    action: action as TelegramAction,
    bookingId,
  };
}

function getStatusForTelegramAction(action: TelegramAction): BookingStatus | null {
  if (action === "confirm") {
    return "confirmed";
  }

  if (action === "cancel") {
    return "cancelled";
  }

  if (action === "complete") {
    return "completed";
  }

  return null;
}

function isAllowedTelegramChat(callbackQuery: TelegramCallbackQuery) {
  const expectedChatId = process.env.TELEGRAM_CHAT_ID;
  const actualChatId = callbackQuery.message?.chat?.id;

  return Boolean(expectedChatId && actualChatId && String(actualChatId) === String(expectedChatId));
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

async function sendTelegramActionFollowup(bookingId: string, message: string) {
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!chatId) {
    return;
  }

  try {
    const booking = await getBookingById(bookingId);
    await telegramApi("sendMessage", {
      chat_id: chatId,
      parse_mode: "HTML",
      text: [
        "<b>DETAILX Booking Update</b>",
        "",
        escapeTelegramHtml(message),
        booking ? `<b>Status:</b> ${formatStatus(booking.status)}` : "",
      ].filter(Boolean).join("\n"),
      reply_markup: booking ? buildTelegramKeyboard(booking.id, booking.status) : undefined,
    });
  } catch (error) {
    console.error("Telegram action follow-up failed", {
      bookingId,
      error,
    });
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
