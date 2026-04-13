# DETAILX Chicago

Premium mobile detailing website for DETAILX Chicago, built as a production-friendly Next.js app with Tailwind CSS styling, an API-backed booking flow, database persistence, dynamic pricing, email confirmations, Telegram admin notifications, and optional SMS support.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- PostgreSQL via `pg`
- Local JSON booking fallback for development
- Resend for email confirmations
- Telegram Bot API for booking notifications
- Twilio for optional SMS confirmations
- Zod for request validation

## Project structure

```text
.
|-- app/
|   |-- admin/schedule/page.tsx
|   |-- api/admin/schedule/route.ts
|   |-- api/availability/route.ts
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
|   |-- adminAuth.ts
|   |-- bookingSchema.ts
|   |-- bookingStore.ts
|   |-- notifications.ts
|   |-- pricing.ts
|   |-- resend.ts
|   |-- schedule.ts
|   |-- siteData.ts
|   `-- telegram.ts
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

The booking form submits to `POST /api/book`, a standard Next.js route handler that is stable across Railway redeploys and does not depend on Server Actions. `POST /api/bookings` is kept as a compatibility alias and uses the same handler.

Validated fields:

- service
- date
- time
- name
- phone
- email
- vehicle type
- estimated price
- address or service location
- optional notes

Pricing logic lives in `lib/pricing.ts`. The booking API recomputes the estimate server-side before saving the booking.

## Scheduling and availability

Availability is built around fixed booking windows from `lib/schedule.ts`:

- 8:00 AM
- 10:30 AM
- 1:00 PM
- 3:30 PM
- 6:00 PM

The customer form loads open times from `GET /api/availability?date=YYYY-MM-DD`. Booked or manually blocked slots are disabled in the UI.

Double-booking is prevented on the server in `lib/bookingStore.ts`. In PostgreSQL, booking save runs inside a transaction, takes a slot-specific advisory lock, checks active bookings and blocked slots for the selected date/time, and only then inserts the booking. If two customers race for the same slot, the second request receives a clear unavailable-slot response. Local JSON fallback also checks availability before saving, but PostgreSQL is recommended for production.

Admin schedule management lives at:

```text
/admin/schedule
```

Set this environment variable before using it:

```bash
ADMIN_SCHEDULE_KEY=
```

Use a long private value. The admin page sends it as an `x-admin-key` header to the protected `POST/GET/PATCH/DELETE /api/admin/schedule` route. Admin tools can view bookings by date, block a slot, remove a block, and update booking status to `pending`, `confirmed`, `cancelled`, or `completed`.

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
  estimated_price text,
  notes text,
  details_json text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedule_blocks (
  id uuid PRIMARY KEY,
  block_date date NOT NULL,
  block_time text NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'blocked',
  created_at timestamptz NOT NULL DEFAULT now()
);
```

If `DATABASE_URL` is not set, bookings are stored locally in `data/bookings.json`. That file is ignored by Git.

## Email confirmations

Email confirmations use Resend. Set:

```bash
RESEND_API_KEY=
BUSINESS_EMAIL=sales@detailxchicago.com
EMAIL_FROM=bookings@detailxchicago.com
RESEND_FROM_EMAIL=bookings@detailxchicago.com
```

`EMAIL_FROM` must be on a verified Resend domain. Use `bookings@detailxchicago.com` when that sender is ready; otherwise set it to another verified sender such as `hello@detailxchicago.com` or `sales@detailxchicago.com`. `RESEND_FROM_EMAIL` is still supported as a fallback for existing deployments. After a booking is saved, the app sends a customer confirmation email and a business notification email to `BUSINESS_EMAIL`. If email sending fails or variables are missing, the booking still saves and the API returns a warning without crashing the customer flow.

## Telegram booking notifications

Telegram admin notifications use the Telegram Bot API when both variables are present:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
TELEGRAM_WEBHOOK_SECRET=
```

Telegram runs only from server routes. Booking notifications send after a booking is saved, and failures are logged server-side without blocking the customer. Inline button actions are handled by `POST /api/telegram`; configure the Telegram webhook to point to your deployed URL and set Telegram's webhook secret token to `TELEGRAM_WEBHOOK_SECRET`.

Telegram booking actions support:

- confirm booking
- cancel booking
- resend confirmation email
- mark complete

Cancelling changes booking status to `cancelled`, which releases the time slot because only `pending` and `confirmed` bookings block availability.

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
