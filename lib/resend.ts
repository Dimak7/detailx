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
  const calendarUrl = buildGoogleCalendarUrl(booking);
  const businessEmail = getBusinessEmail();

  return `
    <div style="margin:0;background:#eeeeea;padding:32px 12px;font-family:Arial,Helvetica,sans-serif;color:#050506;line-height:1.6">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e2dc;border-radius:8px;overflow:hidden;box-shadow:0 18px 60px rgba(5,5,6,0.12)">
        <div style="background:#050506;color:#ffffff;padding:34px 28px 30px">
          <p style="margin:0;color:#c1121f;font-size:12px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase">DETAILX Chicago</p>
          <h1 style="margin:12px 0 0;font-size:34px;line-height:1;text-transform:uppercase">Thank you for booking with DETAILX Chicago.</h1>
          <p style="margin:18px 0 0;color:#c7c9c7;font-size:16px">We appreciate your trust. Your appointment request has been received and we will follow up if anything needs to be confirmed.</p>
        </div>
        <div style="padding:28px">
          <div style="border:1px solid #e6e6df;background:#f7f7f2;border-radius:8px;padding:20px">
            <p style="margin:0;color:#73777c;font-size:12px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase">Appointment estimate</p>
            <p style="margin:8px 0 0;font-size:32px;font-weight:900;line-height:1;color:#050506">${escapeHtml(booking.estimatedPrice || "Estimate pending")}</p>
            <p style="margin:8px 0 0;color:#73777c;font-size:14px">Final scope can vary by condition, access, and selected add-ons.</p>
          </div>
          ${buildDetailCards(booking)}
          <div style="margin-top:24px;text-align:center">
            <a href="${escapeHtml(calendarUrl)}" style="display:inline-block;border-radius:8px;background:#c1121f;color:#ffffff;font-size:14px;font-weight:900;letter-spacing:0.04em;text-decoration:none;text-transform:uppercase;padding:15px 22px">Add to Google Calendar</a>
          </div>
          <p style="margin:24px 0 0;color:#383b40">We will arrive at your location and take care of the detail with a premium, careful process. If anything needs to change, reply to this email or contact us at <a style="color:#c1121f;font-weight:800" href="mailto:${escapeHtml(businessEmail)}">${escapeHtml(businessEmail)}</a>.</p>
          ${buildEmailBanner()}
        </div>
        <div style="border-top:1px solid #e4e4df;background:#050506;padding:22px 28px;color:#c7c9c7;font-size:13px">
          <strong style="color:#ffffff">Thank you for trusting DETAILX Chicago.</strong><br />
          Premium Mobile Detailing in Chicago<br />
          <a style="color:#ffffff" href="mailto:${escapeHtml(businessEmail)}">${escapeHtml(businessEmail)}</a> / <a style="color:#ffffff" href="https://www.instagram.com/detailxchicago/">@detailxchicago</a>
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
          <p style="margin:12px 0 0;color:#c7c9c7;font-size:18px;font-weight:800">${escapeHtml(booking.estimatedPrice || "Estimate pending")}</p>
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
    ["Total price", booking.estimatedPrice || "Estimate pending"],
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

function buildDetailCards(booking: BookingEmail) {
  const details = [
    ["Customer", booking.name],
    ["Service", booking.service],
    ["Vehicle", booking.vehicleType],
    ["Date", booking.date],
    ["Time", booking.time],
    ["Address", booking.address],
    ["Notes", booking.notes || "No extra notes provided."],
  ];

  return `
    <div style="margin-top:22px;border:1px solid #e4e4df;border-radius:8px;overflow:hidden">
      ${details
        .map(
          ([label, value]) => `
            <div style="display:block;border-bottom:1px solid #e4e4df;padding:14px 16px">
              <p style="margin:0;color:#73777c;font-size:11px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase">${escapeHtml(label)}</p>
              <p style="margin:5px 0 0;color:#050506;font-size:15px;font-weight:700">${escapeHtml(value)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function buildEmailBanner() {
  return `
    <div style="margin-top:26px;overflow:hidden;border-radius:8px;border:1px solid #e4e4df;background:#050506">
      <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=82" alt="DETAILX Chicago premium detailing" style="display:block;width:100%;max-width:100%;height:auto" />
      <div style="padding:16px 18px;color:#ffffff">
        <p style="margin:0;color:#c1121f;font-size:12px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase">DETAILX Chicago</p>
        <p style="margin:6px 0 0;color:#c7c9c7;font-size:14px">Premium mobile detailing in Chicago.</p>
      </div>
    </div>
  `;
}

function buildGoogleCalendarUrl(booking: BookingEmail) {
  const start = buildGoogleDateTime(booking.date, booking.time, 0);
  const end = buildGoogleDateTime(booking.date, booking.time, 2);
  const details = [
    `Service: ${booking.service}`,
    `Vehicle: ${booking.vehicleType}`,
    `Estimated price: ${booking.estimatedPrice || "Estimate pending"}`,
    `Notes: ${booking.notes || "No extra notes provided."}`,
    `Booking ID: ${booking.id}`,
  ].join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `DETAILX Chicago - ${booking.service}`,
    dates: `${start}/${end}`,
    details,
    location: booking.address,
    ctz: "America/Chicago",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildGoogleDateTime(dateValue: string, timeValue: string, addHours: number) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const match = timeValue.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  let hour = 9;
  let minute = 0;

  if (match) {
    hour = Number(match[1]);
    minute = Number(match[2] || "0");
    const period = match[3].toUpperCase();

    if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    if (period === "AM" && hour === 12) {
      hour = 0;
    }
  }

  const date = new Date(year, month - 1, day, hour + addHours, minute, 0);
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
