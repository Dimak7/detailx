# DETAILX Chicago

Premium mobile detailing website for DETAILX Chicago, built as a production-friendly Next.js app with Tailwind CSS styling, an API-backed booking flow, database persistence, email confirmations, and optional SMS support.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- PostgreSQL via `pg`
- Local JSON booking fallback for development
- Resend for email confirmations
- Twilio for optional SMS confirmations
- Zod for request validation

## Project structure

```text
.
|-- app/
|   |-- api/bookings/route.ts
|   |-- globals.css
|   |-- layout.tsx
|   `-- page.tsx
|-- components/
|   |-- Nav.tsx
|   `-- booking/BookingForm.tsx
|-- data/
|   `-- .gitkeep
|-- lib/
|   |-- bookingSchema.ts
|   |-- bookingStore.ts
|   |-- notifications.ts
|   `-- siteData.ts
|-- .env.example
|-- package.json
|-- next.config.mjs
|-- postcss.config.mjs
`-- tsconfig.json
```

## Local setup

1. Install Node.js 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Create a local environment file:

```bash
cp .env.example .env.local
```

4. Start the dev server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Booking backend

The booking form submits to `POST /api/bookings`.

Validated fields:

- service
- date
- time
- name
- phone
- email
- vehicle type
- address or service location
- optional notes

If `DATABASE_URL` is set, bookings are stored in PostgreSQL. The app creates this table automatically if it does not exist:

```sql
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
);
```

If `DATABASE_URL` is not set, bookings are stored locally in `data/bookings.json`. That file is ignored by Git.

## Email confirmations

Email confirmations use Resend. Set:

```bash
RESEND_API_KEY=
BOOKING_FROM_EMAIL=
BOOKING_ADMIN_EMAIL=
```

`BOOKING_FROM_EMAIL` must be a verified Resend sender. If email variables are missing, the booking still saves and the API reports email as skipped.

## SMS confirmations

SMS confirmations use Twilio when all Twilio variables are present:

```bash
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

If these are missing, SMS is skipped without blocking the booking.

## Deployment notes

For production, configure environment variables in your host, add a PostgreSQL database, and verify the Resend sender domain before taking live bookings.
