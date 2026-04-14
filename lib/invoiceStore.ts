import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";
import type { StoredBooking } from "./bookingStore";
import { getBookingAmount, getBookingDetails } from "./adminData";
import { sendInvoicePaymentEmail } from "./resend";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceRecord = {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: InvoiceStatus;
  paymentUrl: string;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
};

type InvoiceRow = {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  amount: number | string;
  status: InvoiceStatus;
  payment_url: string | null;
  stripe_session_id: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

let pool: Pool | null = null;
let hasEnsuredInvoiceSchema = false;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

export async function listInvoices() {
  const db = getPool();

  if (db) {
    await ensureInvoiceSchema(db);
    const result = await db.query<InvoiceRow>(
      `SELECT id, booking_id, customer_name, customer_email, amount, status, payment_url, stripe_session_id, created_at, updated_at
       FROM invoices
       ORDER BY created_at DESC
       LIMIT 500`
    );
    return result.rows.map(mapInvoiceRow);
  }

  return readLocalInvoices();
}

export async function createStripeInvoiceForBooking(booking: StoredBooking) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  const amount = getBookingAmount(booking);
  if (!amount) {
    throw new Error("Booking does not have a billable amount.");
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://detailxchicago.com").replace(/\/$/, "");
  const details = getBookingDetails(booking).map((detail) => `${detail.service} / ${detail.vehicleType}`).join(", ");
  const body = new URLSearchParams({
    mode: "payment",
    success_url: `${siteUrl}/admin/invoices?payment=success`,
    cancel_url: `${siteUrl}/admin/invoices?payment=cancelled`,
    customer_email: booking.email,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(amount * 100),
    "line_items[0][price_data][product_data][name]": `DETAILX Chicago - ${details}`,
    "metadata[booking_id]": booking.id,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await response.json().catch(() => null) as { id?: string; url?: string; error?: { message?: string } } | null;

  if (!response.ok || !data?.url || !data.id) {
    throw new Error(data?.error?.message || "Stripe could not create a payment link.");
  }

  const invoice = await saveInvoice({
    id: randomUUID(),
    bookingId: booking.id,
    customerName: booking.name,
    customerEmail: booking.email,
    amount,
    status: "sent",
    paymentUrl: data.url,
    stripeSessionId: data.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  await sendInvoicePaymentEmail(invoice);
  return invoice;
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
  const db = getPool();

  if (db) {
    await ensureInvoiceSchema(db);
    await db.query("UPDATE invoices SET status = $2, updated_at = now() WHERE id = $1", [id, status]);
    return;
  }

  const invoices = await readLocalInvoices();
  await writeLocalInvoices(invoices.map((invoice) => invoice.id === id ? { ...invoice, status, updatedAt: new Date().toISOString() } : invoice));
}

async function saveInvoice(invoice: InvoiceRecord) {
  const db = getPool();

  if (db) {
    await ensureInvoiceSchema(db);
    await db.query(
      `INSERT INTO invoices (id, booking_id, customer_name, customer_email, amount, status, payment_url, stripe_session_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, payment_url = EXCLUDED.payment_url, updated_at = EXCLUDED.updated_at`,
      [invoice.id, invoice.bookingId, invoice.customerName, invoice.customerEmail, invoice.amount, invoice.status, invoice.paymentUrl, invoice.stripeSessionId || null, invoice.createdAt, invoice.updatedAt]
    );
    return invoice;
  }

  const invoices = await readLocalInvoices();
  invoices.unshift(invoice);
  await writeLocalInvoices(invoices);
  return invoice;
}

async function ensureInvoiceSchema(db: Pool) {
  if (hasEnsuredInvoiceSchema) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id uuid PRIMARY KEY,
      booking_id uuid NOT NULL,
      customer_name text NOT NULL,
      customer_email text NOT NULL,
      amount integer NOT NULL,
      status text NOT NULL DEFAULT 'draft',
      payment_url text,
      stripe_session_id text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  hasEnsuredInvoiceSchema = true;
}

async function readLocalInvoices() {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "invoices.json");
  await mkdir(dataDir, { recursive: true });

  try {
    return JSON.parse(await readFile(filePath, "utf8")) as InvoiceRecord[];
  } catch {
    return [];
  }
}

async function writeLocalInvoices(invoices: InvoiceRecord[]) {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "invoices.json");
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(invoices, null, 2));
}

function mapInvoiceRow(row: InvoiceRow): InvoiceRecord {
  return {
    id: row.id,
    bookingId: row.booking_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    amount: Number(row.amount),
    status: row.status,
    paymentUrl: row.payment_url || "",
    stripeSessionId: row.stripe_session_id || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}
