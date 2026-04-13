# DETAILX Chicago

Premium mobile detailing website for DETAILX Chicago, built as a production-friendly Next.js app with Tailwind CSS styling, an API-backed booking flow, database persistence, dynamic pricing, Resend email confirmations, Telegram admin notifications, and optional SMS support.

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
|   |-- api/book/route.ts
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
|   |-- pricing.ts
|   |-- resend.ts
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

Pricing logic lives in `lib/pricing.ts`. The booking API recomputes the estimate server-side before saving the booking, so the frontend display is not trusted as the source of truth.

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
  created_at timestamptz NOT NULL DEFAULT now()
);
```

If `DATABASE_URL` is not set, bookings are stored locally in `data/bookings.json`. That file is ignored by Git.

## Email confirmations

Email confirmations use Resend. Set:

```bash
RESEND_API_KEY=
BUSINESS_EMAIL=sales@detailxchicago.com
RESEND_FROM_EMAIL=bookings@detailxchicago.com
```

`RESEND_FROM_EMAIL` must be on a verified Resend domain. Use `bookings@detailxchicago.com` when that sender is ready; otherwise set it to another verified sender such as `hello@detailxchicago.com` or `sales@detailxchicago.com`. After a booking is saved, the app sends a customer confirmation email and a business notification email to `BUSINESS_EMAIL`. The customer email includes the estimated price, appointment details, a Google Calendar link, and DETAILX Chicago branding. If email sending fails or variables are missing, the booking still saves and the API returns a warning without crashing the customer flow.

## Telegram booking notifications

Telegram admin notifications use the Telegram Bot API when both variables are present:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Create a Telegram bot with BotFather, send a message to the bot or add it to your admin chat, then set `TELEGRAM_CHAT_ID` to the destination chat. Telegram failures are logged server-side and do not block saved bookings.

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
