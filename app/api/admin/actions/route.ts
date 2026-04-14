import { NextResponse } from "next/server";
import { adminUnauthorizedResponse, isAdminRequest } from "@/lib/adminAuth";
import { getBookingById, updateBookingSchedule, updateBookingStatus, createScheduleBlock, deleteScheduleBlock, type BookingStatus } from "@/lib/bookingStore";
import { sendCustomerBookingConfirmation } from "@/lib/resend";
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
      const booking = await getBookingById(String(formData.get("bookingId") || ""));
      if (!booking) {
        throw new Error("Booking was not found.");
      }
      await createStripeInvoiceForBooking(booking);
    }

    if (action === "update-invoice-status") {
      handled = true;
      const status = String(formData.get("status") || "") as InvoiceStatus;
      if (!invoiceStatuses.includes(status)) {
        throw new Error("Choose a valid invoice status.");
      }
      await updateInvoiceStatus(String(formData.get("invoiceId") || ""), status);
    }

    if (!handled) {
      throw new Error("Choose an admin action.");
    }

    return NextResponse.redirect(new URL(withFlash(returnTo, "saved"), request.url), { status: 303 });
  } catch (error) {
    console.error("Admin action failed", { action, error });
    return NextResponse.redirect(new URL(withFlash(returnTo, "error"), request.url), { status: 303 });
  }
}

function withFlash(path: string, status: "saved" | "error") {
  const url = new URL(path.startsWith("http") ? path : `https://detailxchicago.com${path}`);
  url.searchParams.set("adminStatus", status);
  return `${url.pathname}${url.search}`;
}
