import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Pool } from "pg";
import type { BookingInput } from "./bookingSchema";

type StoredBooking = BookingInput & {
  id: string;
  createdAt: string;
};

let pool: Pool | null = null;
let hasEnsuredSchema = false;

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

export async function saveBooking(booking: BookingInput) {
  const storedBooking: StoredBooking = {
    ...booking,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const db = getPool();

  if (db) {
    await ensureSchema(db);
    await db.query(
      `INSERT INTO bookings
        (id, service, booking_date, booking_time, name, phone, email, vehicle_type, address, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        storedBooking.id,
        storedBooking.service,
        storedBooking.date,
        storedBooking.time,
        storedBooking.name,
        storedBooking.phone,
        storedBooking.email,
        storedBooking.vehicleType,
        storedBooking.address,
        storedBooking.notes,
        storedBooking.createdAt,
      ]
    );
    return storedBooking;
  }

  await saveToLocalJson(storedBooking);
  return storedBooking;
}

async function ensureSchema(db: Pool) {
  if (hasEnsuredSchema) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id uuid PRIMARY KEY,
      service text NOT NULL,
      booking_date date NOT NULL,
      booking_time text NOT NULL,
      name text NOT NULL,
      phone text NOT NULL,
      email text NOT NULL,
      vehicle_type text NOT NULL,
      address text NOT NULL,
      notes text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  hasEnsuredSchema = true;
}

async function saveToLocalJson(booking: StoredBooking) {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "bookings.json");
  await mkdir(dataDir, { recursive: true });

  let bookings: StoredBooking[] = [];
  try {
    const existing = await readFile(filePath, "utf8");
    bookings = JSON.parse(existing) as StoredBooking[];
  } catch {
    bookings = [];
  }

  bookings.push(booking);
  await writeFile(filePath, JSON.stringify(bookings, null, 2));
}
