import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import type { Pool } from "pg";
import type { BookingInput } from "./bookingSchema";
import { getDatabasePool } from "./database";
import { isTimeSlot, timeSlots, type SlotAvailability, type TimeSlot } from "./schedule";

export type StoredBooking = BookingInput & {
  id: string;
  createdAt: string;
  status: BookingStatus;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

type DatabaseBookingRow = {
  id: string;
  service: string;
  booking_date: Date | string;
  booking_time: string;
  name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  address: string;
  estimated_price: string | null;
  notes: string | null;
  details_json: string | null;
  status: string | null;
  created_at: Date | string;
};

export type ScheduleBlock = {
  id: string;
  date: string;
  time: TimeSlot;
  reason: string;
  createdAt: string;
};

let hasEnsuredSchema = false;

export async function saveBooking(booking: BookingInput) {
  const storedBooking: StoredBooking = {
    ...booking,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    await saveToDatabase(db, storedBooking);
    return storedBooking;
  }

  await saveToLocalJsonWithAvailability(storedBooking);
  return storedBooking;
}

export async function getAvailability(date: string): Promise<SlotAvailability[]> {
  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    const [bookings, blocks] = await Promise.all([
      db.query<{ booking_time: string }>(
        "SELECT booking_time FROM bookings WHERE booking_date = $1 AND status IN ('pending', 'booked', 'confirmed')",
        [date]
      ),
      db.query<{ block_time: string }>(
        "SELECT block_time FROM schedule_blocks WHERE block_date = $1 AND status = 'blocked'",
        [date]
      ),
    ]);
    const bookedTimes = new Set(bookings.rows.map((row) => row.booking_time));
    const blockedTimes = new Set(blocks.rows.map((row) => row.block_time));

    return buildAvailability(bookedTimes, blockedTimes);
  }

  const bookings = await readLocalBookings();
  const bookedTimes = new Set(
    bookings
      .filter((booking) => booking.date === date && isActiveBookingStatus(booking.status))
      .map((booking) => booking.time)
  );
  const blockedTimes = new Set((await readLocalBlocks()).filter((block) => block.date === date).map((block) => block.time));

  return buildAvailability(bookedTimes, blockedTimes);
}

export async function listBookingsByDate(date: string) {
  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    const result = await db.query<DatabaseBookingRow>(
      `SELECT id, service, booking_date, booking_time, name, phone, email, vehicle_type, address,
        estimated_price, notes, details_json, status, created_at
       FROM bookings
       WHERE booking_date = $1
       ORDER BY booking_time ASC, created_at DESC`,
      [date]
    );

    return result.rows.map(mapDatabaseBooking);
  }

  return (await readLocalBookings())
    .filter((booking) => booking.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
}

export async function listBookings(filters: { date?: string; status?: BookingStatus | "all"; service?: string; search?: string } = {}) {
  const db = getDatabasePool();
  const clauses: string[] = [];
  const values: string[] = [];

  if (filters.date) {
    values.push(filters.date);
    clauses.push(`booking_date = $${values.length}`);
  }

  if (filters.status && filters.status !== "all") {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filters.service && filters.service !== "all") {
    values.push(filters.service);
    clauses.push(`service = $${values.length}`);
  }

  if (filters.search) {
    values.push(`%${filters.search}%`);
    clauses.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length} OR phone ILIKE $${values.length})`);
  }

  if (db) {
    await ensureSchema(db);
    const result = await db.query<DatabaseBookingRow>(
      `SELECT id, service, booking_date, booking_time, name, phone, email, vehicle_type, address,
        estimated_price, notes, details_json, status, created_at
       FROM bookings
       ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
       ORDER BY booking_date DESC, booking_time ASC, created_at DESC
       LIMIT 500`,
      values
    );

    return result.rows.map(mapDatabaseBooking);
  }

  const search = filters.search?.toLowerCase() || "";
  return (await readLocalBookings())
    .filter((booking) => !filters.date || booking.date === filters.date)
    .filter((booking) => !filters.status || filters.status === "all" || booking.status === filters.status)
    .filter((booking) => !filters.service || filters.service === "all" || booking.service === filters.service)
    .filter((booking) => !search || [booking.name, booking.email, booking.phone].some((value) => value.toLowerCase().includes(search)))
    .sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time))
    .slice(0, 500);
}

export async function getBookingById(id: string) {
  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    const result = await db.query<DatabaseBookingRow>(
      `SELECT id, service, booking_date, booking_time, name, phone, email, vehicle_type, address,
        estimated_price, notes, details_json, status, created_at
       FROM bookings
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    const row = result.rows[0];
    return row ? mapDatabaseBooking(row) : null;
  }

  return (await readLocalBookings()).find((booking) => booking.id === id) || null;
}

export async function listScheduleBlocks(date: string) {
  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    const result = await db.query(
      `SELECT id, block_date, block_time, reason, created_at
       FROM schedule_blocks
       WHERE block_date = $1 AND status = 'blocked'
       ORDER BY block_time ASC`,
      [date]
    );

    return result.rows.map((row) => ({
      id: row.id,
      date: formatDatabaseDate(row.block_date),
      time: row.block_time,
      reason: row.reason || "",
      createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    })) as ScheduleBlock[];
  }

  return (await readLocalBlocks()).filter((block) => block.date === date);
}

export async function createScheduleBlock(input: { date: string; time: string; reason?: string }) {
  if (!isTimeSlot(input.time)) {
    throw new Error("Choose a valid time slot.");
  }

  const block: ScheduleBlock = {
    id: randomUUID(),
    date: input.date,
    time: input.time,
    reason: input.reason?.trim() || "Unavailable",
    createdAt: new Date().toISOString(),
  };
  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    await db.query("BEGIN");
    try {
      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${block.date}:${block.time}`]);
      const booked = await db.query(
        "SELECT 1 FROM bookings WHERE booking_date = $1 AND booking_time = $2 AND status IN ('pending', 'booked', 'confirmed') LIMIT 1",
        [block.date, block.time]
      );
      const blocked = await db.query(
        "SELECT 1 FROM schedule_blocks WHERE block_date = $1 AND block_time = $2 AND status = 'blocked' LIMIT 1",
        [block.date, block.time]
      );

      if (booked.rowCount) {
        throw new Error("That slot already has a booking.");
      }

      if (blocked.rowCount) {
        await db.query(
          "UPDATE schedule_blocks SET reason = $3 WHERE block_date = $1 AND block_time = $2 AND status = 'blocked'",
          [block.date, block.time, block.reason]
        );
      } else {
        await db.query(
          `INSERT INTO schedule_blocks (id, block_date, block_time, reason, status, created_at)
           VALUES ($1, $2, $3, $4, 'blocked', $5)`,
          [block.id, block.date, block.time, block.reason, block.createdAt]
        );
      }
      await db.query("COMMIT");
      return block;
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  }

  const bookings = await readLocalBookings();
  if (bookings.some((booking) => booking.date === block.date && booking.time === block.time && isActiveBookingStatus(booking.status))) {
    throw new Error("That slot already has a booking.");
  }

  const blocks = (await readLocalBlocks()).filter((item) => !(item.date === block.date && item.time === block.time));
  blocks.push(block);
  await writeLocalBlocks(blocks);
  return block;
}

export async function deleteScheduleBlock(id: string) {
  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    await db.query("UPDATE schedule_blocks SET status = 'canceled' WHERE id = $1", [id]);
    return;
  }

  await writeLocalBlocks((await readLocalBlocks()).filter((block) => block.id !== id));
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    if (status === "pending" || status === "confirmed") {
      await db.query("BEGIN");
      try {
        const current = await db.query<{ booking_date: Date | string; booking_time: string; status: string | null }>(
          "SELECT booking_date, booking_time, status FROM bookings WHERE id = $1 LIMIT 1",
          [id]
        );
        const booking = current.rows[0];

        if (!booking) {
          throw new Error("Booking was not found.");
        }

        assertStatusTransition(normalizeBookingStatus(booking.status), status);
        const date = formatDatabaseDate(booking.booking_date);
        await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${date}:${booking.booking_time}`]);
        const conflict = await db.query(
          "SELECT 1 FROM bookings WHERE booking_date = $1 AND booking_time = $2 AND id <> $3 AND status IN ('pending', 'booked', 'confirmed') LIMIT 1",
          [date, booking.booking_time, id]
        );
        const block = await db.query(
          "SELECT 1 FROM schedule_blocks WHERE block_date = $1 AND block_time = $2 AND status = 'blocked' LIMIT 1",
          [date, booking.booking_time]
        );

        if (conflict.rowCount || block.rowCount) {
          throw new Error("That slot is not available.");
        }

        await db.query("UPDATE bookings SET status = $2 WHERE id = $1", [id, status]);
        await db.query("COMMIT");
        return;
      } catch (error) {
        await db.query("ROLLBACK");
        throw error;
      }
    }

    const current = await db.query<{ status: string | null }>("SELECT status FROM bookings WHERE id = $1 LIMIT 1", [id]);
    const existing = current.rows[0];
    if (!existing) {
      throw new Error("Booking was not found.");
    }
    assertStatusTransition(normalizeBookingStatus(existing.status), status);
    await db.query("UPDATE bookings SET status = $2 WHERE id = $1", [id, status]);
    return;
  }

  const bookings = await readLocalBookings();
  const target = bookings.find((booking) => booking.id === id);

  if (!target) {
    throw new Error("Booking was not found.");
  }

  assertStatusTransition(target.status, status);

  if (status === "pending" || status === "confirmed") {
    const conflict = bookings.some(
      (booking) =>
        booking.id !== id &&
        booking.date === target.date &&
        booking.time === target.time &&
        isActiveBookingStatus(booking.status)
    );

    const blocks = await readLocalBlocks();
    const blocked = blocks.some((block) => block.date === target.date && block.time === target.time);

    if (conflict || blocked) {
      throw new Error("That slot is not available.");
    }
  }

  await writeLocalBookings(bookings.map((booking) => booking.id === id ? { ...booking, status } : booking));
}

export async function updateBookingSchedule(id: string, input: { date: string; time: string }) {
  if (!isTimeSlot(input.time)) {
    throw new Error("Choose a valid time slot.");
  }

  const db = getDatabasePool();

  if (db) {
    await ensureSchema(db);
    await db.query("BEGIN");
    try {
      const current = await db.query<{ status: string | null }>("SELECT status FROM bookings WHERE id = $1 LIMIT 1", [id]);
      const booking = current.rows[0];

      if (!booking) {
        throw new Error("Booking was not found.");
      }

      if (!isActiveBookingStatus(normalizeBookingStatus(booking.status))) {
        throw new Error("Only pending or confirmed bookings can be rescheduled.");
      }

      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${input.date}:${input.time}`]);
      const conflict = await db.query(
        "SELECT 1 FROM bookings WHERE booking_date = $1 AND booking_time = $2 AND id <> $3 AND status IN ('pending', 'booked', 'confirmed') LIMIT 1",
        [input.date, input.time, id]
      );
      const block = await db.query(
        "SELECT 1 FROM schedule_blocks WHERE block_date = $1 AND block_time = $2 AND status = 'blocked' LIMIT 1",
        [input.date, input.time]
      );

      if (conflict.rowCount || block.rowCount) {
        throw new Error("That slot is not available.");
      }

      await db.query("UPDATE bookings SET booking_date = $2, booking_time = $3 WHERE id = $1", [id, input.date, input.time]);
      await db.query("COMMIT");
      return;
    } catch (error) {
      await db.query("ROLLBACK");
      throw error;
    }
  }

  const bookings = await readLocalBookings();
  const target = bookings.find((booking) => booking.id === id);

  if (!target) {
    throw new Error("Booking was not found.");
  }

  if (!isActiveBookingStatus(target.status)) {
    throw new Error("Only pending or confirmed bookings can be rescheduled.");
  }

  const blocks = await readLocalBlocks();
  const conflict =
    bookings.some((booking) => booking.id !== id && booking.date === input.date && booking.time === input.time && isActiveBookingStatus(booking.status)) ||
    blocks.some((block) => block.date === input.date && block.time === input.time);

  if (conflict) {
    throw new Error("That slot is not available.");
  }

  await writeLocalBookings(bookings.map((booking) => booking.id === id ? { ...booking, date: input.date, time: input.time as TimeSlot } : booking));
}

async function saveToDatabase(db: Pool, storedBooking: StoredBooking) {
  await db.query("BEGIN");
  try {
    await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${storedBooking.date}:${storedBooking.time}`]);
    const existingBooking = await db.query(
      "SELECT 1 FROM bookings WHERE booking_date = $1 AND booking_time = $2 AND status IN ('pending', 'booked', 'confirmed') LIMIT 1",
      [storedBooking.date, storedBooking.time]
    );
    const block = await db.query(
      "SELECT 1 FROM schedule_blocks WHERE block_date = $1 AND block_time = $2 AND status = 'blocked' LIMIT 1",
      [storedBooking.date, storedBooking.time]
    );

    if (existingBooking.rowCount || block.rowCount) {
      throw new Error("This time is no longer available. Please choose another slot.");
    }

    await db.query(
      `INSERT INTO bookings
        (id, service, booking_date, booking_time, name, phone, email, vehicle_type, address, estimated_price, notes, details_json, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
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
        storedBooking.estimatedPrice,
        storedBooking.notes,
        JSON.stringify(storedBooking.details || []),
        storedBooking.status,
        storedBooking.createdAt,
      ]
    );
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");

    if (isUniqueViolation(error)) {
      throw new Error("This time is no longer available. Please choose another slot.");
    }

    throw error;
  }
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
      estimated_price text,
      notes text,
      details_json text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS estimated_price text");
  await db.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS details_json text");
  await db.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending'");
  await db.query("ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'pending'");
  await db.query(`
    CREATE TABLE IF NOT EXISTS schedule_blocks (
      id uuid PRIMARY KEY,
      block_date date NOT NULL,
      block_time text NOT NULL,
      reason text,
      status text NOT NULL DEFAULT 'blocked',
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  hasEnsuredSchema = true;
}

async function saveToLocalJsonWithAvailability(booking: StoredBooking) {
  const [bookings, blocks] = await Promise.all([readLocalBookings(), readLocalBlocks()]);

  if (blocks.some((block) => block.date === booking.date && block.time === booking.time)) {
    throw new Error("This time is no longer available. Please choose another slot.");
  }

  if (bookings.some((item) => item.date === booking.date && item.time === booking.time && isActiveBookingStatus(item.status))) {
    throw new Error("This time is no longer available. Please choose another slot.");
  }

  bookings.push(booking);
  await writeLocalBookings(bookings);
}

async function readLocalBookings() {
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

  return bookings.map((booking) => ({ ...booking, status: normalizeBookingStatus(booking.status) }));
}

async function writeLocalBookings(bookings: StoredBooking[]) {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "bookings.json");
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(bookings, null, 2));
}

async function readLocalBlocks() {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "schedule-blocks.json");
  await mkdir(dataDir, { recursive: true });

  try {
    return JSON.parse(await readFile(filePath, "utf8")) as ScheduleBlock[];
  } catch {
    return [];
  }
}

async function writeLocalBlocks(blocks: ScheduleBlock[]) {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "schedule-blocks.json");
  await mkdir(dataDir, { recursive: true });
  await writeFile(filePath, JSON.stringify(blocks, null, 2));
}

function buildAvailability(bookedTimes: Set<string>, blockedTimes: Set<string>): SlotAvailability[] {
  return timeSlots.map((time) => ({
    time,
    available: !bookedTimes.has(time) && !blockedTimes.has(time),
    reason: bookedTimes.has(time) ? "booked" : blockedTimes.has(time) ? "blocked" : undefined,
  }));
}

function mapDatabaseBooking(row: DatabaseBookingRow): StoredBooking {
  return {
    id: row.id,
    service: row.service as StoredBooking["service"],
    date: formatDatabaseDate(row.booking_date),
    time: row.booking_time as StoredBooking["time"],
    name: row.name,
    phone: row.phone,
    email: row.email,
    vehicleType: row.vehicle_type as StoredBooking["vehicleType"],
    address: row.address,
    estimatedPrice: row.estimated_price || "",
    notes: row.notes || "",
    details: safeJsonParse(row.details_json) as StoredBooking["details"],
    status: normalizeBookingStatus(row.status),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function normalizeBookingStatus(status: string | undefined | null): BookingStatus {
  if (status === "confirmed" || status === "completed" || status === "cancelled") {
    return status;
  }

  if (status === "canceled") {
    return "cancelled";
  }

  return "pending";
}

function isActiveBookingStatus(status: BookingStatus) {
  return status === "pending" || status === "confirmed";
}

function assertStatusTransition(current: BookingStatus, next: BookingStatus) {
  if (current === next) {
    return;
  }

  if (current === "cancelled") {
    throw new Error("Cancelled bookings cannot be changed from Telegram/admin controls.");
  }

  if (current === "completed") {
    throw new Error("Completed bookings cannot be changed from Telegram/admin controls.");
  }

  if (next === "completed" && current !== "confirmed" && current !== "pending") {
    throw new Error("Only pending or confirmed bookings can be marked complete.");
  }
}

function safeJsonParse(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

function formatDatabaseDate(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}
