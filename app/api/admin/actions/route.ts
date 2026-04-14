import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, isAdminRequest } from "@/lib/adminAuth";
import { getBookingById, updateBookingSchedule, updateBookingStatus, createScheduleBlock, deleteScheduleBlock, type BookingStatus } from "@/lib/bookingStore";
import { sendClientPromotionEmail, sendCustomerBookingConfirmation } from "@/lib/resend";
import { createStripeInvoiceForBooking, updateInvoiceStatus, type InvoiceStatus } from "@/lib/invoiceStore";

export const runtime = "nodejs";

const bookingStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;
const invoiceStatuses = ["draft", "sent", "paid", "overdue", "cancelled"] as const;

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return adminUnauthorizedResponse();
  }

  const formData = await request.formData();
  const action = String(formData.get("action") || "");
  const returnTo = String(formData.get("returnTo") || "/admin/dashboard");
  let handled = false;
  let adminMessage = "Admin update saved.";

  try {
    if (action === "update-booking-status") {
      handled = true;
      const status = String(formData.get("status") || "") as BookingStatus;
      if (!bookingStatuses.includes(status)) {
        throw new Error("Choose a valid booking status.");
      }
      await updateBookingStatus(String(formData.get("bookingId") || ""), status);
    }

    if (action === "reschedule-booking") {
      handled = true;
      await updateBookingSchedule(String(formData.get("bookingId") || ""), {
        date: String(formData.get("date") || ""),
        time: String(formData.get("time") || ""),
      });
    }

    if (action === "resend-email") {
      handled = true;
      const booking = await getBookingById(String(formData.get("bookingId") || ""));
      if (!booking) {
        throw new Error("Booking was not found.");
      }
      await sendCustomerBookingConfirmation(booking);
    }

    if (action === "block-slot") {
      handled = true;
      await createScheduleBlock({
        date: String(formData.get("date") || ""),
        time: String(formData.get("time") || ""),
        reason: String(formData.get("reason") || "Unavailable"),
      });
    }

    if (action === "remove-block") {
      handled = true;
      await deleteScheduleBlock(String(formData.get("blockId") || ""));
    }

    if (action === "create-invoice") {
      handled = true;
      const bookingId = String(formData.get("bookingId") || "");
      console.info("Admin invoice action started", { bookingId });
      const booking = await getBookingById(bookingId);
      if (!booking) {
        throw new Error("Booking was not found.");
      }
      console.info("Admin invoice booking loaded", { bookingId: booking.id });
      const invoiceResult = await createStripeInvoiceForBooking(booking);
      if (!invoiceResult.success) {
        throw new Error(invoiceResult.error || "Invoice could not be created. Check Stripe setup or booking data.");
      }
      adminMessage = "Invoice created. Payment link is ready.";
    }

    if (action === "update-invoice-status") {
      handled = true;
      console.info("Admin invoice status action started", { invoiceId: String(formData.get("invoiceId") || "") });
      const status = String(formData.get("status") || "") as InvoiceStatus;
      if (!invoiceStatuses.includes(status)) {
        throw new Error("Choose a valid invoice status.");
      }
      await updateInvoiceStatus(String(formData.get("invoiceId") || ""), status);
      console.info("Admin invoice status action completed", { invoiceId: String(formData.get("invoiceId") || ""), status });
      adminMessage = "Invoice status updated.";
    }

    if (action === "send-client-promotion") {
      handled = true;
      const to = String(formData.get("email") || "").trim();
      const name = String(formData.get("name") || "").trim();
      const subject = String(formData.get("subject") || "").trim();
      const message = String(formData.get("message") || "").trim();
      console.info("Admin client promotion email started", { to, hasSubject: Boolean(subject), hasMessage: Boolean(message) });

      if (!to || !name || !subject || !message) {
        throw new Error("Client email, name, subject, and message are required.");
      }

      await sendClientPromotionEmail({ to, name, subject, message });
      console.info("Admin client promotion email sent", { to });
      adminMessage = "Client email sent.";
    }

    if (!handled) {
      throw new Error("Choose an admin action.");
    }

    const redirectUrl = new URL(withFlash(returnTo, "saved", adminMessage), request.url);
    console.info("Admin action final response returned", { action, redirectTo: `${redirectUrl.pathname}${redirectUrl.search}` });
    return NextResponse.redirect(redirectUrl, { status: 303 });
  } catch (error) {
    console.error("Admin action failed", { action, error });
    const errorMessage = error instanceof Error && error.message
      ? error.message
      : "Invoice could not be created. Check Stripe setup or booking data.";
    const redirectUrl = new URL(withFlash(returnTo, "error", errorMessage), request.url);
    console.info("Admin action final response returned", { action, redirectTo: `${redirectUrl.pathname}${redirectUrl.search}`, failed: true });
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }
}

function withFlash(path: string, status: "saved" | "error", message?: string) {
  const url = new URL(sanitizeReturnPath(path), "https://detailxchicago.com");
  url.searchParams.set("adminStatus", status);
  if (message) {
    url.searchParams.set("adminMessage", message);
  }
  return `${url.pathname}${url.search}`;
}

function sanitizeReturnPath(path: string) {
  if (!path) {
    return "/admin/dashboard";
  }

  try {
    const url = new URL(path, "https://detailxchicago.com");
    if (!url.pathname.startsWith("/admin")) {
      return "/admin/dashboard";
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return "/admin/dashboard";
  }
}
