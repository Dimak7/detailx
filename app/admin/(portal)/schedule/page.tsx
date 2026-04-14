import Link from "next/link";
import { AdminPageHeader, FlashMessage, StatusBadge } from "@/components/admin/AdminShell";
import { getBookingDetails, addDays, getDateString } from "@/lib/adminData";
import { getAvailability, listBookingsByDate, listScheduleBlocks } from "@/lib/bookingStore";
import { timeSlots } from "@/lib/schedule";

export default async function AdminSchedulePage({ searchParams }: { searchParams?: Promise<{ date?: string; view?: string; adminStatus?: string; adminMessage?: string }> }) {
  const params = await searchParams;
  const date = params?.date || getDateString(new Date());
  const view = params?.view === "week" ? "week" : "day";
  const dates = view === "week" ? Array.from({ length: 7 }, (_, index) => getDateString(addDays(new Date(`${date}T00:00:00`), index))) : [date];
  const schedule = await Promise.all(dates.map(async (scheduleDate) => ({
    date: scheduleDate,
    availability: await getAvailability(scheduleDate),
    bookings: await listBookingsByDate(scheduleDate),
    blocks: await listScheduleBlocks(scheduleDate),
  })));

  return (
    <>
      <FlashMessage status={params?.adminStatus} message={params?.adminMessage} />
      <AdminPageHeader
        eyebrow="Calendar"
        title="Schedule"
        copy="Manage live availability. Blocks and active bookings immediately affect public booking availability."
        action={<Link className="rounded-lg bg-red px-5 py-4 text-center font-black uppercase text-white" href="/admin/bookings">All Bookings</Link>}
      />
      <form className="mb-5 grid gap-3 rounded-lg bg-white p-4 ring-1 ring-ink/10 md:grid-cols-[1fr_1fr_auto]" action="/admin/schedule">
        <input className="admin-input" name="date" defaultValue={date} type="date" />
        <select className="admin-input" name="view" defaultValue={view}>
          <option value="day">Day view</option>
          <option value="week">Week view</option>
        </select>
        <button className="rounded-lg bg-ink px-5 py-3 font-black uppercase text-white" type="submit">Open</button>
      </form>

      <section className="grid gap-6">
        {schedule.map((day) => (
          <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10" key={day.date}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-black uppercase leading-none">{day.date}</h2>
              <form className="flex flex-wrap gap-2" action="/api/admin/actions" method="post">
                <input type="hidden" name="action" value="block-slot" />
                <input type="hidden" name="returnTo" value={`/admin/schedule?date=${date}&view=${view}`} />
                <input type="hidden" name="date" value={day.date} />
                <select className="admin-input min-w-36" name="time">
                  {timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
                </select>
                <input className="admin-input min-w-48" name="reason" placeholder="Reason" />
                <button className="rounded-lg bg-red px-4 py-3 text-sm font-black uppercase text-white" type="submit">Block</button>
              </form>
            </div>
            <div className="mt-5 grid gap-3 lg:grid-cols-5">
              {day.availability.map((slot) => {
                const booking = day.bookings.find((item) => item.time === slot.time && item.status !== "cancelled");
                const block = day.blocks.find((item) => item.time === slot.time);
                return (
                  <div className={`rounded-lg p-4 ring-1 ${slot.available ? "bg-smoke ring-ink/10" : "bg-ink text-white ring-ink"}`} key={slot.time}>
                    <div className="flex items-center justify-between">
                      <p className="font-black uppercase">{slot.time}</p>
                      <StatusBadge status={slot.available ? "open" : slot.reason || "busy"} />
                    </div>
                    {booking ? (
                      <div className="mt-4">
                        <p className="font-black uppercase">{booking.name}</p>
                        <p className="mt-1 text-sm text-ash">{getBookingDetails(booking).map((detail) => detail.service).join(" + ")}</p>
                        <Link className="mt-3 inline-flex text-xs font-black uppercase text-red-soft" href={`/admin/bookings?search=${encodeURIComponent(booking.email)}`}>Open booking</Link>
                      </div>
                    ) : null}
                    {block ? (
                      <form className="mt-4" action="/api/admin/actions" method="post">
                        <input type="hidden" name="action" value="remove-block" />
                        <input type="hidden" name="blockId" value={block.id} />
                        <input type="hidden" name="returnTo" value={`/admin/schedule?date=${date}&view=${view}`} />
                        <p className="text-sm font-bold text-ash">{block.reason}</p>
                        <button className="mt-2 text-xs font-black uppercase text-red-soft" type="submit">Remove block</button>
                      </form>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
