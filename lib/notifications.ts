import { Resend } from "resend";
import twilio from "twilio";
import type { BookingInput } from "./bookingSchema";

type NotificationResult = {
  email: "sent" | "skipped" | "failed";
  sms: "sent" | "skipped" | "failed";
};

const defaultBusinessEmail = "sales@detailxchicago.com";

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
  const apiKey = process.env.EMAIL_API_KEY;
  const businessEmail = process.env.BUSINESS_EMAIL || defaultBusinessEmail;
  const from = process.env.EMAIL_FROM || `DETAILX Chicago <${businessEmail}>`;

  if (!apiKey || !from) {
    console.info("Email skipped. Configure EMAIL_API_KEY and EMAIL_FROM to enable Resend confirmations.");
    return "skipped";
  }

  try {
    const resend = new Resend(apiKey);
    const [customerResult, businessResult] = await Promise.allSettled([
      sendResendEmail(resend, {
        from,
        to: booking.email,
        subject: "Your DETAILX Chicago Booking Confirmation",
        html: buildCustomerEmailHtml(booking, businessEmail),
        replyTo: businessEmail,
      }),
      sendResendEmail(resend, {
        from,
        to: businessEmail,
        subject: "New Booking - DETAILX Chicago",
        html: buildBusinessEmailHtml(booking),
        replyTo: booking.email,
      }),
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

async function sendResendEmail(
  resend: Resend,
  message: {
    from: string;
    to: string;
    subject: string;
    html: string;
    replyTo: string;
  }
) {
  const { error } = await resend.emails.send(message);

  if (error) {
    throw new Error(JSON.stringify(error));
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

function buildCustomerEmailHtml(booking: BookingInput & { id: string }, businessEmail: string) {
  return `
    <div style="margin:0;background:#f5f5f2;padding:32px 16px;font-family:Arial,sans-serif;color:#050506;line-height:1.6">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e4e4df;border-radius:8px;overflow:hidden">
        <div style="background:#050506;color:#ffffff;padding:28px">
          <p style="margin:0;color:#c1121f;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase">DETAILX Chicago</p>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.05;text-transform:uppercase">Your booking request is confirmed.</h1>
        </div>
        <div style="padding:28px">
          <p style="margin:0 0 18px">Thank you for booking with DETAILX Chicago, ${escapeHtml(booking.name)}. We received your appointment request and will arrive at your location ready to take care of the details.</p>
          ${buildDetailTable(booking)}
          <p style="margin:22px 0 0">If anything needs to change, reply to this email or contact us at <a style="color:#c1121f;font-weight:700" href="mailto:${escapeHtml(businessEmail)}">${escapeHtml(businessEmail)}</a>.</p>
        </div>
        <div style="border-top:1px solid #e4e4df;padding:18px 28px;color:#73777c;font-size:13px">
          Premium Mobile Detailing in Chicago
        </div>
      </div>
    </div>
  `;
}

function buildBusinessEmailHtml(booking: BookingInput & { id: string }) {
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
          Booking ID: ${booking.id}
        </div>
      </div>
    </div>
  `;
}

function buildDetailTable(booking: BookingInput & { id: string }) {
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
