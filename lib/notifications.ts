import twilio from "twilio";
import type { BookingInput } from "./bookingSchema";
import {
  isResendConfigured,
  sendBusinessBookingNotification,
  sendCustomerBookingConfirmation,
} from "./resend";
import { sendTelegramBookingNotification } from "./telegram";

type NotificationResult = {
  email: "sent" | "skipped" | "failed";
  sms: "sent" | "skipped" | "failed";
  telegram: "sent" | "skipped" | "failed";
};

export async function sendBookingNotifications(booking: BookingInput & { id: string }) {
  const result: NotificationResult = {
    email: "skipped",
    sms: "skipped",
    telegram: "skipped",
  };

  const [emailResult, smsResult, telegramResult] = await Promise.all([
    sendEmail(booking),
    sendSms(booking),
    sendTelegramBookingNotification(booking),
  ]);
  result.email = emailResult;
  result.sms = smsResult;
  result.telegram = telegramResult;

  return result;
}

async function sendEmail(booking: BookingInput & { id: string }): Promise<NotificationResult["email"]> {
  console.info("Booking email notification config", {
    hasResendApiKey: isResendConfigured(),
  });

  if (!isResendConfigured()) {
    console.error("Email skipped: RESEND_API_KEY is not configured. Booking was saved, but Resend confirmation emails were not sent.");
    return "skipped";
  }

  try {
    const [customerResult, businessResult] = await Promise.allSettled([
      sendCustomerBookingConfirmation(booking),
      sendBusinessBookingNotification(booking),
    ]);

    if (customerResult.status === "rejected") {
      console.error("Customer booking email failed", customerResult.reason);
    }

    if (businessResult.status === "rejected") {
      console.error("Business booking email failed", businessResult.reason);
    }

    if (customerResult.status === "rejected" || businessResult.status === "rejected") {
      return "failed";
    }

    return "sent";
  } catch (error) {
    console.error("Booking email failed", error);
    return "failed";
  }
}

async function sendSms(booking: BookingInput & { id: string }): Promise<NotificationResult["sms"]> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    return "skipped";
  }

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      from,
      to: booking.phone,
      body: `DETAILX Chicago received your ${booking.service} request for ${booking.date} at ${booking.time}. Confirmation: ${booking.id}`,
    });
    return "sent";
  } catch (error) {
    console.error("Booking SMS failed", error);
    return "failed";
  }
}
