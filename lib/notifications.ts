import { Resend } from "resend";
import twilio from "twilio";
import type { BookingInput } from "./bookingSchema";

type NotificationResult = {
  email: "sent" | "skipped" | "failed";
  sms: "sent" | "skipped" | "failed";
};

export async function sendBookingNotifications(booking: BookingInput & { id: string }) {
  const result: NotificationResult = {
    email: "skipped",
    sms: "skipped",
  };

  const emailResult = await sendEmail(booking);
  result.email = emailResult;

  const smsResult = await sendSms(booking);
  result.sms = smsResult;

  return result;
}

async function sendEmail(booking: BookingInput & { id: string }): Promise<NotificationResult["email"]> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  const adminEmail = process.env.BOOKING_ADMIN_EMAIL;

  if (!apiKey || !from) {
    console.info("Email skipped. Configure RESEND_API_KEY and BOOKING_FROM_EMAIL to enable confirmations.");
    return "skipped";
  }

  try {
    const resend = new Resend(apiKey);
    const subject = `DETAILX Chicago booking request ${booking.id}`;
    const html = buildEmailHtml(booking);
    const to = adminEmail ? [booking.email, adminEmail] : [booking.email];

    await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

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

function buildEmailHtml(booking: BookingInput & { id: string }) {
  return `
    <div style="font-family:Arial,sans-serif;color:#0c0d0b;line-height:1.6">
      <h1>DETAILX Chicago booking request received</h1>
      <p>Thanks, ${escapeHtml(booking.name)}. We received your request and will confirm final availability shortly.</p>
      <ul>
        <li><strong>Confirmation:</strong> ${booking.id}</li>
        <li><strong>Service:</strong> ${escapeHtml(booking.service)}</li>
        <li><strong>Date:</strong> ${escapeHtml(booking.date)}</li>
        <li><strong>Time:</strong> ${escapeHtml(booking.time)}</li>
        <li><strong>Vehicle:</strong> ${escapeHtml(booking.vehicleType)}</li>
        <li><strong>Location:</strong> ${escapeHtml(booking.address)}</li>
      </ul>
      <p>${escapeHtml(booking.notes || "No extra notes provided.")}</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
