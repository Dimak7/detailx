import { Resend } from "resend";
import type { BookingInput } from "./bookingSchema";

type BookingEmail = BookingInput & { id: string };

const defaultBusinessEmail = "sales@detailxchicago.com";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new Resend(apiKey);
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getBusinessEmail() {
  return process.env.BUSINESS_EMAIL || defaultBusinessEmail;
}

export function getResendFromEmail() {
  const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.BUSINESS_EMAIL || defaultBusinessEmail;
  return fromEmail.includes("<") ? fromEmail : `DETAILX Chicago <${fromEmail}>`;
}

export async function sendCustomerBookingConfirmation(booking: BookingEmail) {
  await sendEmail({
    label: "customer-booking-confirmation",
    to: booking.email,
    subject: "Your DETAILX Chicago Booking Confirmation",
    html: buildCustomerEmailHtml(booking),
    replyTo: getBusinessEmail(),
  });
}

export async function sendBusinessBookingNotification(booking: BookingEmail) {
  await sendEmail({
    label: "business-booking-notification",
    to: getBusinessEmail(),
    subject: "New Booking - DETAILX Chicago",
    html: buildBusinessEmailHtml(booking),
    replyTo: booking.email,
  });
}

async function sendEmail(message: {
  label: string;
  to: string;
  subject: string;
  html: string;
  replyTo: string;
}) {
  const resend = getResendClient();
  const from = getResendFromEmail();

  console.info("Resend booking email config", {
    label: message.label,
    hasResendApiKey: Boolean(process.env.RESEND_API_KEY),
    from,
    to: message.to,
    businessEmail: getBusinessEmail(),
  });

  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const response = await resend.emails.send({
    from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    replyTo: message.replyTo,
  });

  console.info("Resend booking email response", {
    label: message.label,
    response,
  });

  if (response.error) {
    console.error("Resend booking email error", {
      label: message.label,
      error: response.error,
    });
    throw new Error(JSON.stringify(response.error));
  }

  return response.data;
}

function buildCustomerEmailHtml(booking: BookingEmail) {
  return `
    <div style="margin:0;background:#f5f5f2;padding:32px 16px;font-family:Arial,sans-serif;color:#050506;line-height:1.6">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e4df;border-radius:8px;overflow:hidden">
        <div style="background:#050506;color:#ffffff;padding:28px">
          <p style="margin:0;color:#c1121f;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase">DETAILX Chicago</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.05;text-transform:uppercase">Your booking request has been received.</h1>
        </div>
        <div style="padding:28px">
          <p style="margin:0 0 18px">Thank you for booking with DETAILX Chicago, ${escapeHtml(booking.name)}. Your appointment request has been received. We'll follow up if anything needs to be confirmed.</p>
          ${buildDetailTable(booking)}
          <p style="margin:22px 0 0">If anything needs to change, reply to this email or contact us at <a style="color:#c1121f;font-weight:700" href="mailto:${escapeHtml(getBusinessEmail())}">${escapeHtml(getBusinessEmail())}</a>.</p>
        </div>
        <div style="border-top:1px solid #e4e4df;padding:18px 28px;color:#73777c;font-size:13px">
          DETAILX Chicago<br />Premium Mobile Detailing in Chicago
        </div>
      </div>
    </div>
  `;
}

function buildBusinessEmailHtml(booking: BookingEmail) {
  return `
    <div style="margin:0;background:#f5f5f2;padding:32px 16px;font-family:Arial,sans-serif;color:#050506;line-height:1.6">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e4e4df;border-radius:8px;overflow:hidden">
        <div style="background:#050506;color:#ffffff;padding:28px">
          <p style="margin:0;color:#c1121f;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase">New booking</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.05;text-transform:uppercase">${escapeHtml(booking.service)} / ${escapeHtml(booking.date)} at ${escapeHtml(booking.time)}</h1>
        </div>
        <div style="padding:28px">
          <p style="margin:0 0 18px"><strong>Contact:</strong> ${escapeHtml(booking.name)} / ${escapeHtml(booking.phone)} / <a style="color:#c1121f;font-weight:700" href="mailto:${escapeHtml(booking.email)}">${escapeHtml(booking.email)}</a></p>
          ${buildDetailTable(booking)}
        </div>
        <div style="border-top:1px solid #e4e4df;padding:18px 28px;color:#73777c;font-size:13px">
          DETAILX Chicago<br />Premium Mobile Detailing in Chicago<br />Booking ID: ${booking.id}
        </div>
      </div>
    </div>
  `;
}

function buildDetailTable(booking: BookingEmail) {
  const details = [
    ["Confirmation", booking.id],
    ["Name", booking.name],
    ["Service", booking.service],
    ["Date", booking.date],
    ["Time", booking.time],
    ["Vehicle", booking.vehicleType],
    ["Location", booking.address],
    ["Phone", booking.phone],
    ["Email", booking.email],
    ["Notes", booking.notes || "No extra notes provided."],
  ];

  return `
    <table style="width:100%;border-collapse:collapse;border:1px solid #e4e4df">
      <tbody>
        ${details
          .map(
            ([label, value]) => `
              <tr>
                <th style="width:34%;padding:12px;text-align:left;background:#f5f5f2;border-bottom:1px solid #e4e4df;font-size:13px;text-transform:uppercase">${escapeHtml(label)}</th>
                <td style="padding:12px;border-bottom:1px solid #e4e4df">${escapeHtml(value)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
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
