"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

const timeSlots = ["8:00 AM", "10:30 AM", "1:00 PM", "3:30 PM", "6:00 PM"];
const vehicleTypes = ["Sedan / Coupe", "SUV / Crossover", "Truck", "Luxury / Exotic", "Fleet vehicle"];

type BookingFormProps = {
  services: string[];
};

type Status = {
  type: "idle" | "success" | "error";
  message: string;
};

export function BookingForm({ services }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });
  const formRef = useRef<HTMLFormElement>(null);

  const calendarDays = useMemo(() => buildCalendar(cursor), [cursor]);
  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget || formRef.current;
    setStatus({ type: "idle", message: "" });

    if (!form) {
      setStatus({ type: "error", message: "We could not read the booking form. Please refresh and try again." });
      return;
    }

    if (!selectedDate || !selectedTime) {
      setStatus({ type: "error", message: "Choose a date and time before requesting your detail." });
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.date = selectedDate;
    payload.time = selectedTime;

    setLoading(true);
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Booking request failed.");
      }

      (formRef.current ?? form)?.reset();
      setSelectedDate("");
      setSelectedTime("");
      setStatus({
        type: "success",
        message:
          result.notifications?.email === "sent"
            ? "Booking confirmed. Check your email for details. Questions? sales@detailxchicago.com"
            : "Booking confirmed. We received your request and will follow up from sales@detailxchicago.com shortly.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function moveMonth(direction: number) {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + direction);
    const today = new Date();
    const firstAllowed = new Date(today.getFullYear(), today.getMonth(), 1);

    if (next >= firstAllowed) {
      setCursor(next);
    }
  }

  return (
    <form ref={formRef} className="rounded-lg bg-white p-4 shadow-[0_28px_90px_rgba(5,5,6,0.3)] ring-1 ring-white/20 backdrop-blur md:p-6" onSubmit={submitBooking}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 font-black uppercase text-sm text-ink">
          Service
          <select className="field" name="service" required defaultValue="">
            <option value="" disabled>Choose service</option>
            {services.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 font-black uppercase text-sm text-ink">
          Vehicle type
          <select className="field" name="vehicleType" required defaultValue="">
            <option value="" disabled>Choose vehicle</option>
            {vehicleTypes.map((vehicle) => (
              <option key={vehicle}>{vehicle}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 rounded-lg bg-ink p-4 text-white ring-1 ring-red/25">
        <div className="mb-4 grid grid-cols-[44px_1fr_44px] items-center gap-3 text-center">
          <button className="calendar-control" type="button" onClick={() => moveMonth(-1)} aria-label="Previous month">-</button>
          <p className="font-black uppercase">{monthLabel}</p>
          <button className="calendar-control" type="button" onClick={() => moveMonth(1)} aria-label="Next month">+</button>
        </div>
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-black uppercase text-ash">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            day ? (
              <button
                className={`rounded-lg py-3 text-sm font-black transition ${selectedDate === day.iso ? "bg-red text-white" : "bg-white/10 text-white hover:bg-white/20"} disabled:cursor-not-allowed disabled:opacity-30`}
                disabled={day.disabled}
                key={day.iso}
                onClick={() => setSelectedDate(day.iso)}
                type="button"
              >
                {day.label}
              </button>
            ) : (
              <span key={`blank-${index}`} />
            )
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-5">
        {timeSlots.map((time) => (
          <button className={`rounded-lg px-3 py-3 text-sm font-black transition ${selectedTime === time ? "bg-red text-white" : "bg-smoke text-ink hover:bg-red-soft"}`} key={time} onClick={() => setSelectedTime(time)} type="button">
            {time}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="form-label">Name<input className="field" name="name" minLength={2} required placeholder="Your name" /></label>
        <label className="form-label">Phone<input className="field" name="phone" required placeholder="(312) 555-0148" /></label>
        <label className="form-label">Email<input className="field" name="email" type="email" required placeholder="you@email.com" /></label>
        <label className="form-label">Service location<input className="field" name="address" minLength={5} required placeholder="Chicago address or neighborhood" /></label>
      </div>
      <label className="form-label mt-4">Optional notes<textarea className="field min-h-28 resize-y" name="notes" maxLength={800} placeholder="Parking access, pet hair, stains, coating goals, tint questions..." /></label>
      <button className="mt-5 w-full rounded-lg bg-red px-6 py-4 font-black uppercase text-white shadow-[0_16px_42px_rgba(193,18,31,0.25)] transition hover:-translate-y-0.5 hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "Requesting..." : "Request Booking"}
      </button>
      {status.message ? (
        <p className={`mt-4 rounded-lg px-4 py-3 text-sm font-bold ${status.type === "success" ? "bg-red-soft text-ink" : "bg-red-100 text-red-900"}`}>
          {status.message}
        </p>
      ) : null}
      <style jsx>{`
        .field {
          min-height: 52px;
          width: 100%;
          border-radius: 8px;
          border: 1px solid rgba(5, 5, 6, 0.14);
          background: rgba(245, 245, 242, 0.9);
          padding: 0.85rem 0.95rem;
          color: var(--ink);
          outline: none;
        }
        .field:focus {
          border-color: var(--red);
          box-shadow: 0 0 0 4px rgba(193, 18, 31, 0.18);
        }
        .form-label {
          display: grid;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--ink);
        }
        .calendar-control {
          height: 44px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: var(--white);
          font-weight: 900;
        }
      `}</style>
    </form>
  );
}

function buildCalendar(cursor: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Array<{ iso: string; label: number; disabled: boolean } | null> = [];

  for (let i = 0; i < firstDay; i += 1) {
    days.push(null);
  }

  for (let label = 1; label <= daysInMonth; label += 1) {
    const date = new Date(year, month, label);
    days.push({
      iso: formatDate(date),
      label,
      disabled: date < today,
    });
  }

  return days;
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
