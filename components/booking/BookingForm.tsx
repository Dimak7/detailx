"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import {
  buildBookingEstimate,
  getStartingPriceLabel,
  pricedServices,
  vehicleTypes,
  type BookingDetailSelection,
  type BookingService,
  type VehicleType,
} from "@/lib/pricing";

const timeSlots = ["8:00 AM", "10:30 AM", "1:00 PM", "3:30 PM", "6:00 PM"];
const maxDetails = 6;

type Status = {
  type: "idle" | "success" | "error";
  message: string;
};

type ServiceCounts = Record<BookingService, number>;

const initialServiceCounts = pricedServices.reduce((counts, service, index) => {
  counts[service.title] = index === 0 ? 1 : 0;
  return counts;
}, {} as ServiceCounts);

export function BookingForm() {
  const [serviceCounts, setServiceCounts] = useState<ServiceCounts>(initialServiceCounts);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>("Sedan");
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
  const selectedDetails = buildDetailsFromCounts(serviceCounts, selectedVehicle);
  const bookingEstimate = buildBookingEstimate(selectedDetails);
  const estimatedPrice = bookingEstimate.estimatedPrice;
  const totalDetails = selectedDetails.length;
  const primaryDetail = selectedDetails[0] ?? { service: pricedServices[0].title, vehicleType: selectedVehicle };

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget || formRef.current;
    setStatus({ type: "idle", message: "" });

    if (!form) {
      setStatus({ type: "error", message: "We could not read the booking form. Please refresh and try again." });
      return;
    }

    if (!selectedDetails.length) {
      setStatus({ type: "error", message: "Add at least one detail before requesting your booking." });
      return;
    }

    if (!selectedDate || !selectedTime) {
      setStatus({ type: "error", message: "Choose a date and time before requesting your detail." });
      return;
    }

    const formData = new FormData(form);
    const payload: Record<string, unknown> = Object.fromEntries(formData.entries());
    const primaryNotes = String(payload.notes || "");
    const details = selectedDetails.map((detail) => ({ ...detail, notes: primaryNotes }));
    payload.service = primaryDetail.service;
    payload.vehicleType = selectedVehicle;
    payload.estimatedPrice = estimatedPrice;
    payload.date = selectedDate;
    payload.time = selectedTime;
    payload.details = details;

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
      setServiceCounts(initialServiceCounts);
      setSelectedVehicle("Sedan");
      setSelectedDate("");
      setSelectedTime("");
      setStatus({
        type: "success",
        message: getSuccessMessage(result),
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

  function updateServiceCount(service: BookingService, change: number) {
    setServiceCounts((current) => {
      const nextTotal = getDetailCount(current) + change;
      const nextCount = Math.max(0, current[service] + change);

      if (nextTotal < 1 || nextTotal > maxDetails) {
        return current;
      }

      return {
        ...current,
        [service]: nextCount,
      };
    });
  }

  return (
    <form ref={formRef} className="rounded-lg bg-white p-3 text-ink shadow-[0_28px_90px_rgba(5,5,6,0.3)] ring-1 ring-white/20 backdrop-blur md:p-5" onSubmit={submitBooking}>
      <input name="service" type="hidden" value={primaryDetail.service} />
      <input name="vehicleType" type="hidden" value={selectedVehicle} />
      <input name="estimatedPrice" type="hidden" value={estimatedPrice} />

      <div className="rounded-lg bg-ink p-4 text-white">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-red">Reservation</p>
            <h3 className="mt-2 text-2xl font-black uppercase leading-none">Build your detail.</h3>
          </div>
          <div className="rounded-lg bg-white px-4 py-3 text-right text-ink">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-steel">{totalDetails} detail{totalDetails === 1 ? "" : "s"}</p>
            <p className="text-2xl font-black leading-none">{estimatedPrice}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {pricedServices.map((service) => {
          const count = serviceCounts[service.title];
          const active = count > 0;
          return (
            <article
              className={`group overflow-hidden rounded-lg border text-left transition ${active ? "border-red bg-ink text-white shadow-[0_18px_48px_rgba(193,18,31,0.2)]" : "border-ink/10 bg-smoke text-ink hover:border-red/40"}`}
              key={service.title}
            >
              <div className="relative h-28 overflow-hidden">
                <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${service.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                <span className="absolute left-3 top-3 rounded-lg bg-red px-2.5 py-1 text-xs font-black uppercase text-white">{service.code}</span>
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-white p-1 text-ink shadow-lg">
                  <button aria-label={`Remove ${service.title}`} className="grid h-8 w-8 place-items-center rounded-md bg-smoke text-lg font-black transition hover:bg-red-soft disabled:opacity-40" disabled={count === 0 || totalDetails === 1} onClick={() => updateServiceCount(service.title, -1)} type="button">
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-black">{count}</span>
                  <button aria-label={`Add ${service.title}`} className="grid h-8 w-8 place-items-center rounded-md bg-red text-lg font-black text-white transition hover:bg-red-dark disabled:opacity-40" disabled={totalDetails >= maxDetails} onClick={() => updateServiceCount(service.title, 1)} type="button">
                    +
                  </button>
                </div>
              </div>
              <div className="p-4">
                <p className={`text-xs font-black uppercase ${active ? "text-red-soft" : "text-red"}`}>{service.tone}</p>
                <h4 className="mt-1 text-lg font-black uppercase leading-none">{service.title}</h4>
                <p className={`mt-2 text-sm font-black ${active ? "text-white" : "text-ink"}`}>{getStartingPriceLabel(service.title)}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-ink/10 bg-smoke p-4 md:grid-cols-[1fr_0.86fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-red">Vehicle size</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {vehicleTypes.map((vehicle) => (
              <button
                className={`rounded-lg px-3 py-3 text-sm font-black uppercase transition ${selectedVehicle === vehicle ? "bg-red text-white shadow-[0_12px_30px_rgba(193,18,31,0.2)]" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-red/40"}`}
                key={vehicle}
                onClick={() => setSelectedVehicle(vehicle)}
                type="button"
              >
                {vehicle}
              </button>
            ))}
          </div>
        </div>
        <aside className="rounded-lg bg-white p-4 ring-1 ring-ink/10">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-steel">Offer</p>
          <p className="mt-2 text-2xl font-black uppercase leading-none">{bookingEstimate.discountApplied ? "10% discount applied" : "Add more to save"}</p>
          <p className="mt-2 text-sm leading-6 text-steel">Every added detail after the first receives 10% off. Mix services like Exterior Detail plus Interior Detail.</p>
        </aside>
      </div>

      <div className="mt-4 rounded-lg bg-smoke p-4 ring-1 ring-ink/10">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-red">Booking summary</p>
        <div className="mt-3 grid gap-2">
          {bookingEstimate.details.map((detail) => (
            <div className="flex items-start justify-between gap-4 rounded-lg bg-white px-4 py-3" key={detail.lineNumber}>
              <div>
                <p className="font-black uppercase leading-tight">Detail {detail.lineNumber}: {detail.service}</p>
                <p className="mt-1 text-sm font-bold text-steel">{detail.vehicleType}{detail.discountPercent ? ` / ${detail.discountPercent}% off` : ""}</p>
              </div>
              <p className="text-right font-black text-ink">{detail.estimatedPrice}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-ink px-4 py-4 text-white">
          <span className="text-sm font-black uppercase text-ash">Total estimate</span>
          <span className="text-2xl font-black">{bookingEstimate.estimatedPrice}</span>
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-ink p-4 text-white ring-1 ring-red/25">
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

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {timeSlots.map((time) => (
          <button className={`rounded-lg px-3 py-3 text-sm font-black transition ${selectedTime === time ? "bg-red text-white" : "bg-smoke text-ink hover:bg-red-soft"}`} key={time} onClick={() => setSelectedTime(time)} type="button">
            {time}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="form-label">Name<input className="field" name="name" minLength={2} required placeholder="Your name" /></label>
        <label className="form-label">Phone<input className="field" name="phone" required placeholder="(312) 555-0148" /></label>
        <label className="form-label">Email<input className="field" name="email" type="email" required placeholder="you@email.com" /></label>
        <label className="form-label">Service location<input className="field" name="address" minLength={5} required placeholder="Chicago address or neighborhood" /></label>
      </div>
      <label className="form-label mt-4">Optional notes<textarea className="field min-h-28 resize-y" name="notes" maxLength={800} placeholder="Parking access, pet hair, stains, coating goals, tint questions..." /></label>
      <button className="mt-5 w-full rounded-lg bg-red px-6 py-4 font-black uppercase text-white shadow-[0_16px_42px_rgba(193,18,31,0.25)] transition hover:-translate-y-0.5 hover:bg-red-dark disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} type="submit">
        {loading ? "Requesting..." : `Request Booking - ${estimatedPrice}`}
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

function buildDetailsFromCounts(counts: ServiceCounts, vehicleType: VehicleType): BookingDetailSelection[] {
  return pricedServices.flatMap((service) =>
    Array.from({ length: counts[service.title] }, () => ({
      service: service.title,
      vehicleType,
    }))
  );
}

function getDetailCount(counts: ServiceCounts) {
  return Object.values(counts).reduce((total, count) => total + count, 0);
}

function getSuccessMessage(result: { status?: string; emailSent?: boolean; warning?: string }) {
  if (result.status === "booking_saved_email_sent" || result.emailSent) {
    return "Booking confirmed. Check your email for details.";
  }

  return "Booking received. We'll contact you shortly.";
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
