"use client";

import { FormEvent, useEffect, useState } from "react";
import { timeSlots, type SlotAvailability } from "@/lib/schedule";

type AdminBooking = {
  id: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  address: string;
  estimatedPrice: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
};

type ScheduleBlock = {
  id: string;
  date: string;
  time: string;
  reason: string;
};

type ScheduleResponse = {
  availability: SlotAvailability[];
  bookings: AdminBooking[];
  blocks: ScheduleBlock[];
};

export default function ScheduleAdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [date, setDate] = useState(getTodayDate);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedKey = window.localStorage.getItem("detailx-admin-key");
    if (savedKey) {
      setAdminKey(savedKey);
    }
  }, []);

  useEffect(() => {
    if (adminKey) {
      loadSchedule();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, adminKey]);

  async function loadSchedule() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/schedule?date=${encodeURIComponent(date)}`, {
        headers: { "x-admin-key": adminKey },
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load schedule.");
      }

      setSchedule(result);
      window.localStorage.setItem("detailx-admin-key", adminKey);
    } catch (error) {
      setSchedule(null);
      setMessage(error instanceof Error ? error.message : "Could not load schedule.");
    } finally {
      setLoading(false);
    }
  }

  async function blockSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await mutateSchedule("POST", {
      date,
      time: formData.get("time"),
      reason: formData.get("reason") || "Unavailable",
    });
    form.reset();
  }

  async function removeBlock(id: string) {
    await mutateSchedule("DELETE", null, `?id=${encodeURIComponent(id)}`);
  }

  async function updateStatus(id: string, status: AdminBooking["status"]) {
    await mutateSchedule("PATCH", { id, status });
  }

  async function mutateSchedule(method: string, body?: Record<string, unknown> | null, query = "") {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/schedule${query}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not update schedule.");
      }

      await loadSchedule();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update schedule.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-6xl">
        <div className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.42)] md:p-8">
          <p className="eyebrow">DETAILX admin</p>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h1 className="text-4xl font-black uppercase leading-none md:text-6xl">Schedule Manager</h1>
              <p className="mt-3 max-w-2xl text-ash">View bookings, block time, and keep customer slots from overlapping.</p>
            </div>
            <a className="rounded-lg bg-red px-5 py-3 text-center font-black uppercase text-white transition hover:bg-red-dark" href="/">
              Back to site
            </a>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="grid gap-2 text-sm font-black uppercase text-ash">
              Admin password
              <input className="admin-field" value={adminKey} onChange={(event) => setAdminKey(event.target.value)} type="password" placeholder="ADMIN_SCHEDULE_KEY" />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase text-ash">
              Date
              <input className="admin-field" value={date} onChange={(event) => setDate(event.target.value)} type="date" />
            </label>
            <button className="rounded-lg bg-white px-5 py-3 font-black uppercase text-ink transition hover:bg-red-soft md:self-end" disabled={!adminKey || loading} onClick={loadSchedule} type="button">
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {message ? <p className="mt-4 rounded-lg bg-red-soft px-4 py-3 font-bold text-ink">{message}</p> : null}
        </div>

        {schedule ? (
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
            <section className="rounded-lg bg-white p-5 text-ink">
              <h2 className="text-2xl font-black uppercase leading-none">Availability</h2>
              <div className="mt-5 grid gap-2">
                {schedule.availability.map((slot) => (
                  <div className="flex items-center justify-between rounded-lg bg-smoke px-4 py-3" key={slot.time}>
                    <span className="font-black">{slot.time}</span>
                    <span className={`rounded-lg px-3 py-1 text-xs font-black uppercase ${slot.available ? "bg-ink text-white" : "bg-red-soft text-ink"}`}>
                      {slot.available ? "Open" : slot.reason}
                    </span>
                  </div>
                ))}
              </div>

              <form className="mt-6 rounded-lg border border-ink/10 p-4" onSubmit={blockSlot}>
                <p className="text-sm font-black uppercase text-red">Block time</p>
                <select className="admin-field mt-3" name="time" required>
                  {timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
                </select>
                <input className="admin-field mt-3" name="reason" placeholder="Reason, e.g. Personal time" />
                <button className="mt-3 w-full rounded-lg bg-red px-4 py-3 font-black uppercase text-white" disabled={loading} type="submit">Block Slot</button>
              </form>

              {schedule.blocks.length ? (
                <div className="mt-6 grid gap-2">
                  {schedule.blocks.map((block) => (
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-ink px-4 py-3 text-white" key={block.id}>
                      <span className="font-bold">{block.time} / {block.reason}</span>
                      <button className="text-sm font-black uppercase text-red-soft" onClick={() => removeBlock(block.id)} type="button">Remove</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-lg bg-white p-5 text-ink">
              <h2 className="text-2xl font-black uppercase leading-none">Bookings</h2>
              <div className="mt-5 grid gap-3">
                {schedule.bookings.length ? schedule.bookings.map((booking) => (
                  <article className="rounded-lg border border-ink/10 bg-smoke p-4" key={booking.id}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs font-black uppercase text-red">{booking.time} / {booking.status}</p>
                        <h3 className="mt-1 text-xl font-black uppercase leading-none">{booking.name}</h3>
                        <p className="mt-2 text-sm font-bold text-steel">{booking.service} / {booking.vehicleType} / {booking.estimatedPrice}</p>
                        <p className="mt-2 text-sm text-steel">{booking.address}</p>
                        <p className="mt-2 text-sm text-steel">{booking.phone} / {booking.email}</p>
                      </div>
                      <select className="admin-field md:max-w-40" value={booking.status} onChange={(event) => updateStatus(booking.id, event.target.value as AdminBooking["status"])}>
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="cancelled">cancelled</option>
                        <option value="completed">completed</option>
                      </select>
                    </div>
                  </article>
                )) : <p className="rounded-lg bg-smoke px-4 py-6 text-center font-bold text-steel">No bookings for this date.</p>}
              </div>
            </section>
          </div>
        ) : null}
      </div>
      <style jsx>{`
        .admin-field {
          min-height: 48px;
          width: 100%;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: #ffffff;
          padding: 0.75rem 0.9rem;
          color: var(--ink);
          outline: none;
        }
      `}</style>
    </main>
  );
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
