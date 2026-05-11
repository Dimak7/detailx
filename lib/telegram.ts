import { assertFutureDate, bookingServices, type BookingInput } from "./bookingSchema";
import { listBookingsByDate, listScheduleBlocks, saveBooking, type BookingStatus, type StoredBooking } from "./bookingStore";
import { buildBookingEstimate, pricedServices, vehicleTypes, type BookingService, type VehicleType } from "./pricing";
import { isTimeSlot, parseTimeSlotToMinutes, timeSlots, type TimeSlot } from "./schedule";
import {
  clearTelegramManualSession,
  getTelegramManualSession,
  saveTelegramManualSession,
  type TelegramManualSession,
  type TelegramManualStep,
} from "./telegramManualStore";

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

type TelegramMessage = {
  chat?: {
    id?: number | string;
  };
  text?: string;
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
      reply_markup: {
        inline_keyboard: [
          [{ text: "\u2795 New Booking", callback_data: "manual_new" }],
          [{ text: "Open Admin", url: buildAdminBookingUrl(booking) }],
        ],
      },
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
  const chatId = getChatId(callbackQuery.message?.chat?.id);
  const data = callbackQuery.data || "";
  console.info("Telegram action received", {
    callbackQueryId: callbackQuery.id,
    data,
    chatId,
  });

  try {
    if (!chatId) {
      await answerTelegramCallback(callbackQuery.id, "Missing Telegram chat.");
      return { ok: false, message: "Missing Telegram chat." };
    }

    if (data === "manual_new") {
      await startManualBooking(chatId);
      await answerTelegramCallback(callbackQuery.id, "New booking started.");
      return { ok: true, message: "New booking started." };
    }

    if (data === "manual_cancel") {
      await clearTelegramManualSession(chatId);
      await sendTelegramMessage(chatId, "Manual booking cancelled.");
      await answerTelegramCallback(callbackQuery.id, "Cancelled.");
      return { ok: true, message: "Manual booking cancelled." };
    }

    if (data === "manual_confirm") {
      const result = await confirmManualBooking(chatId);
      await answerTelegramCallback(callbackQuery.id, result.ok ? "Booking saved." : "Could not save booking.");
      return result;
    }

    await answerTelegramCallback(callbackQuery.id, "Use /newbooking or the New Booking button.");
    return { ok: true, message: "No supported Telegram action." };
  } catch (error) {
    console.error("Telegram callback failed", { data, chatId, error });
    await answerTelegramCallback(callbackQuery.id, "Telegram action failed. Check server logs.");
    return { ok: false, message: "Telegram action failed." };
  }
}

export async function handleTelegramMessage(message: TelegramMessage): Promise<TelegramActionResult> {
  const chatId = getChatId(message.chat?.id);
  const text = (message.text || "").trim();

  if (!chatId || !text) {
    return { ok: true, message: "No Telegram text message." };
  }

  try {
    if (text.toLowerCase() === "/start" || text.toLowerCase() === "/help") {
      await sendTelegramStartMenu(chatId);
      return { ok: true, message: "Telegram start menu sent." };
    }

    if (text.toLowerCase() === "/newbooking" || text.toLowerCase() === "new booking") {
      await startManualBooking(chatId);
      return { ok: true, message: "Manual booking started." };
    }

    const session = await getTelegramManualSession(chatId);
    if (!session) {
      return { ok: true, message: "No active manual booking session." };
    }

    if (text.toLowerCase() === "/cancel") {
      await clearTelegramManualSession(chatId);
      await sendTelegramMessage(chatId, "Manual booking cancelled.");
      return { ok: true, message: "Manual booking cancelled." };
    }

    await processManualBookingInput(session, text);
    return { ok: true, message: "Manual booking step saved." };
  } catch (error) {
    console.error("Telegram message handling failed", { chatId, error });
    await sendTelegramMessage(chatId, error instanceof Error ? error.message : "That did not work. Please try again.");
    return { ok: false, message: "Telegram message failed." };
  }
}

export async function sendDailyTelegramSchedule(date = getTodayChicagoDate()) {
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!chatId) {
    console.error("Daily Telegram schedule skipped: TELEGRAM_CHAT_ID is not configured.");
    return "skipped" as const;
  }

  try {
    const [bookings, blocks] = await Promise.all([listBookingsByDate(date), listScheduleBlocks(date)]);
    const message = buildDailyScheduleMessage(date, bookings, blocks);
    await sendTelegramMessage(chatId, message, {
      inline_keyboard: [[{ text: "\u2795 New Booking", callback_data: "manual_new" }]],
    });
    console.info("Daily Telegram schedule sent", { date, bookingCount: bookings.length, blockCount: blocks.length });
    return "sent" as const;
  } catch (error) {
    console.error("Daily Telegram schedule failed", { date, error });
    return "failed" as const;
  }
}

async function startManualBooking(chatId: string) {
  await saveTelegramManualSession({
    chatId,
    step: "name",
    data: {},
    updatedAt: new Date().toISOString(),
  });
  await sendTelegramMessage(chatId, "\u2795 <b>New DETAILX Booking</b>\n\nCustomer name?");
}

async function sendTelegramStartMenu(chatId: string) {
  await sendTelegramMessage(
    chatId,
    [
      "<b>DETAILX admin bot</b>",
      "",
      "Use the button below to add a phone, Instagram, or text booking.",
      "You can also send /newbooking anytime.",
    ].join("\n"),
    {
      inline_keyboard: [[{ text: "\u2795 New Booking", callback_data: "manual_new" }]],
    }
  );
}

async function processManualBookingInput(session: TelegramManualSession, text: string) {
  const nextSession: TelegramManualSession = {
    ...session,
    data: { ...session.data },
    updatedAt: new Date().toISOString(),
  };

  if (session.step === "name") {
    nextSession.data.name = requireMinText(text, "Customer name", 2);
    nextSession.step = "phone";
    await saveAndPrompt(nextSession, "Phone number?");
    return;
  }

  if (session.step === "phone") {
    nextSession.data.phone = requireMinText(text, "Phone number", 7);
    nextSession.step = "date";
    await saveAndPrompt(nextSession, "Date? Use YYYY-MM-DD.");
    return;
  }

  if (session.step === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      throw new Error("Use date format YYYY-MM-DD.");
    }
    assertFutureDate(text);
    nextSession.data.date = text;
    nextSession.step = "time";
    await saveAndPrompt(nextSession, `Time?\n\nAvailable starts:\n${timeSlots.join(", ")}`);
    return;
  }

  if (session.step === "time") {
    const time = normalizeTelegramTime(text);
    if (!time) {
      throw new Error(`Choose one of these times: ${timeSlots.join(", ")}`);
    }
    nextSession.data.time = time;
    nextSession.step = "service";
    await saveAndPrompt(nextSession, buildServicePrompt());
    return;
  }

  if (session.step === "service") {
    const service = normalizeTelegramService(text);
    if (!service) {
      throw new Error("Choose a valid service number or name.");
    }
    nextSession.data.service = service;
    nextSession.step = "vehicleType";
    await saveAndPrompt(nextSession, "Vehicle type? Sedan, SUV, or Truck.");
    return;
  }

  if (session.step === "vehicleType") {
    const vehicleType = normalizeTelegramVehicle(text);
    if (!vehicleType) {
      throw new Error("Vehicle type must be Sedan, SUV, or Truck.");
    }
    nextSession.data.vehicleType = vehicleType;
    nextSession.step = "address";
    await saveAndPrompt(nextSession, "Address/location?");
    return;
  }

  if (session.step === "address") {
    nextSession.data.address = requireMinText(text, "Address/location", 5);
    nextSession.step = "notes";
    await saveAndPrompt(nextSession, "Notes? Type skip if none.");
    return;
  }

  if (session.step === "notes") {
    nextSession.data.notes = isSkip(text) ? "" : text.slice(0, 800);
    nextSession.step = "price";
    await saveAndPrompt(nextSession, "Price if available? Type skip to use the estimate.");
    return;
  }

  if (session.step === "price") {
    nextSession.data.price = isSkip(text) ? "" : normalizePrice(text);
    nextSession.step = "confirm";
    await saveTelegramManualSession(nextSession);
    await sendTelegramMessage(session.chatId, buildManualBookingConfirmation(nextSession), {
      inline_keyboard: [[
        { text: "Confirm", callback_data: "manual_confirm" },
        { text: "Cancel", callback_data: "manual_cancel" },
      ]],
    });
  }
}

async function confirmManualBooking(chatId: string): Promise<TelegramActionResult> {
  const session = await getTelegramManualSession(chatId);
  if (!session || session.step !== "confirm") {
    await sendTelegramMessage(chatId, "No manual booking is ready to confirm. Send /newbooking to start again.");
    return { ok: false, message: "No booking ready to confirm." };
  }

  const data = session.data;
  if (!data.name || !data.phone || !data.date || !data.time || !data.service || !data.vehicleType || !data.address) {
    throw new Error("Manual booking is missing required details. Send /newbooking to start again.");
  }

  if (!isTimeSlot(data.time)) {
    throw new Error("Manual booking time is not valid.");
  }

  const detail = { service: data.service, vehicleType: data.vehicleType, notes: data.notes || "" };
  const estimate = buildBookingEstimate([detail]);
  const booking: BookingInput = {
    service: data.service,
    date: data.date,
    time: data.time,
    name: data.name,
    phone: data.phone,
    email: "",
    vehicleType: data.vehicleType,
    address: data.address,
    notes: data.notes || "",
    estimatedPrice: data.price || estimate.estimatedPrice,
    details: estimate.details,
    source: "telegram_manual",
  };

  const savedBooking = await saveBooking(booking);
  await clearTelegramManualSession(chatId);
  await sendTelegramMessage(chatId, [
    "\u2705 <b>Booking saved</b>",
    "",
    buildTelegramBookingMessage(savedBooking),
  ].join("\n"));
  return { ok: true, message: "Manual booking saved." };
}

async function saveAndPrompt(session: TelegramManualSession, prompt: string) {
  await saveTelegramManualSession(session);
  await sendTelegramMessage(session.chatId, prompt);
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
    `<b>Email:</b> ${escapeTelegramHtml(booking.email || "N/A")}`,
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

function buildDailyScheduleMessage(date: string, bookings: StoredBooking[], blocks: Awaited<ReturnType<typeof listScheduleBlocks>>) {
  const activeBookings = bookings.filter((booking) => booking.status !== "cancelled").sort((a, b) => sortByTime(a.time, b.time));
  const sortedBlocks = [...blocks].sort((a, b) => sortByTime(a.startTime || a.time, b.startTime || b.time));

  if (!activeBookings.length && !sortedBlocks.length) {
    return `Good morning. No bookings scheduled for today.\n\n${escapeTelegramHtml(date)}`;
  }

  return [
    "<b>Good morning - DETAILX schedule for today</b>",
    escapeTelegramHtml(date),
    "",
    ...activeBookings.flatMap((booking) => {
      const details = booking.details?.length ? booking.details : [{ service: booking.service, vehicleType: booking.vehicleType }];
      return [
        `<b>${escapeTelegramHtml(booking.time)}</b>`,
        `Client: ${escapeTelegramHtml(booking.name)}`,
        `Phone: ${escapeTelegramHtml(booking.phone)}`,
        `Service: ${escapeTelegramHtml(details.map((detail) => detail.service).join(" + "))}`,
        `Vehicle: ${escapeTelegramHtml(details.map((detail) => detail.vehicleType).join(" + "))}`,
        `Address: ${escapeTelegramHtml(booking.address)}`,
        `Price: ${escapeTelegramHtml(booking.estimatedPrice || "Estimate pending")}`,
        booking.notes ? `Notes: ${escapeTelegramHtml(booking.notes)}` : "",
        "",
      ].filter(Boolean);
    }),
    ...sortedBlocks.flatMap((block) => [
      "<b>Blocked Time</b>",
      `${escapeTelegramHtml(block.startTime || block.time)} - ${escapeTelegramHtml(block.endTime)}`,
      `Reason: ${escapeTelegramHtml(block.reason || "Unavailable")}`,
      "",
    ]),
  ].join("\n");
}

function buildManualBookingConfirmation(session: TelegramManualSession) {
  const data = session.data;
  const estimate = data.service && data.vehicleType
    ? buildBookingEstimate([{ service: data.service, vehicleType: data.vehicleType, notes: data.notes || "" }]).estimatedPrice
    : "Estimate pending";

  return [
    "<b>Confirm booking?</b>",
    "",
    `Name: ${escapeTelegramHtml(data.name || "")}`,
    `Phone: ${escapeTelegramHtml(data.phone || "")}`,
    `Date: ${escapeTelegramHtml(data.date || "")}`,
    `Time: ${escapeTelegramHtml(data.time || "")}`,
    `Service: ${escapeTelegramHtml(data.service || "")}`,
    `Vehicle: ${escapeTelegramHtml(data.vehicleType || "")}`,
    `Address: ${escapeTelegramHtml(data.address || "")}`,
    `Price: ${escapeTelegramHtml(data.price || estimate)}`,
    `Notes: ${escapeTelegramHtml(data.notes || "N/A")}`,
  ].join("\n");
}

function buildServicePrompt() {
  return [
    "Service/detail name?",
    "",
    ...pricedServices.map((service, index) => `${index + 1}. ${service.title}`),
  ].join("\n");
}

function buildAdminBookingUrl(booking: TelegramBooking) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://detailxchicago.com").replace(/\/$/, "");
  const search = booking.email || booking.phone || booking.id;
  return `${siteUrl}/admin/bookings?search=${encodeURIComponent(search)}`;
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

async function sendTelegramMessage(chatId: string, text: string, replyMarkup?: Record<string, unknown>) {
  return telegramApi("sendMessage", {
    chat_id: chatId,
    parse_mode: "HTML",
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
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

function normalizeTelegramTime(value: string): TimeSlot | null {
  const compact = value.trim().toLowerCase().replace(/\s+/g, "");
  const direct = timeSlots.find((slot) => slot.toLowerCase().replace(/\s+/g, "") === compact);
  if (direct) {
    return direct;
  }

  const hourMatch = compact.match(/^(\d{1,2})(?::00)?(am|pm)?$/);
  if (!hourMatch) {
    return null;
  }

  const hour = Number(hourMatch[1]);
  const period = hourMatch[2] || (hour >= 6 && hour <= 11 ? "am" : "pm");
  const candidate = `${hour}:00 ${period.toUpperCase()}`;
  return isTimeSlot(candidate) ? candidate : null;
}

function normalizeTelegramService(value: string): BookingService | null {
  const index = Number(value.trim());
  if (Number.isInteger(index) && index > 0 && index <= pricedServices.length) {
    return pricedServices[index - 1].title;
  }

  const normalized = value.trim().toLowerCase();
  const service = bookingServices.find((item) => item.toLowerCase() === normalized) || pricedServices.find((item) => item.title.toLowerCase().includes(normalized))?.title;
  return service || null;
}

function normalizeTelegramVehicle(value: string): VehicleType | null {
  const normalized = value.trim().toLowerCase();
  return vehicleTypes.find((vehicle) => vehicle.toLowerCase() === normalized) || null;
}

function requireMinText(value: string, label: string, minLength: number) {
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    throw new Error(`${label} is too short.`);
  }

  return trimmed;
}

function normalizePrice(value: string) {
  const cleaned = value.trim();
  if (!cleaned) {
    return "";
  }

  return cleaned.startsWith("$") ? cleaned : `$${cleaned}`;
}

function isSkip(value: string) {
  return ["skip", "none", "n/a", "na", "-"].includes(value.trim().toLowerCase());
}

function getChatId(value: number | string | undefined) {
  return value === undefined ? "" : String(value);
}

function getTodayChicagoDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function formatStatus(status: BookingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function sortByTime(first: string, second: string) {
  return (parseTimeSlotToMinutes(first) ?? 0) - (parseTimeSlotToMinutes(second) ?? 0);
}

function escapeTelegramHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
