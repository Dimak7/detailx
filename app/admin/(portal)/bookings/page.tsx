import { AdminPageHeader, FlashMessage, StatusBadge } from "@/components/admin/AdminShell";
import { getBookingDetails } from "@/lib/adminData";
import { listBookings, type BookingStatus } from "@/lib/bookingStore";
import { pricedServices } from "@/lib/pricing";
import { timeSlots } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({ searchParams }: { searchParams?: Promise<{ date?: string; status?: BookingStatus | "all"; service?: string; search?: string; adminStatus?: string; adminMessage?: string }> }) {
  const params = await searchParams;
  const bookings = await listBookings({
    date: params?.date,
    status: params?.status || "all",
    service: params?.service || "all",
    search: params?.search,
  });
  const returnTo = `/admin/bookings?${new URLSearchParams({
    ...(params?.date ? { date: params.date } : {}),
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.service ? { service: params.service } : {}),
    ...(params?.search ? { search: params.search } : {}),
  }).toString()}`;

  return (
    <>
      <FlashMessage status={params?.adminStatus} message={params?.adminMessage} />
      <AdminPageHeader eyebrow="Manage" title="Bookings" copy="Confirm, cancel, resend confirmations, create invoices, and review customer details." />
      <form className="mb-5 grid gap-3 rounded-lg bg-white p-4 ring-1 ring-ink/10 md:grid-cols-[1fr_1fr_1fr_1fr_auto]" action="/admin/bookings">
        <input className="admin-input" name="search" defaultValue={params?.search || ""} placeholder="Search customer, email, phone" />
        <input className="admin-input" name="date" defaultValue={params?.date || ""} type="date" />
        <select className="admin-input" name="status" defaultValue={params?.status || "all"}>
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="admin-input" name="service" defaultValue={params?.service || "all"}>
          <option value="all">All services</option>
          {pricedServices.map((service) => <option key={service.title} value={service.title}>{service.title}</option>)}
        </select>
        <button className="rounded-lg bg-ink px-5 py-3 font-black uppercase text-white" type="submit">Filter</button>
      </form>

      <section className="grid gap-4">
        {bookings.length ? bookings.map((booking) => (
          <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10" key={booking.id}>
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={booking.status} />
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-steel">ID {booking.id}</p>
                </div>
                <h2 className="mt-3 text-2xl font-black uppercase leading-none">{booking.name}</h2>
                <p className="mt-2 text-sm font-bold text-steel">{booking.date} / {booking.time} / {booking.estimatedPrice || "Estimate pending"}</p>
                <p className="mt-2 text-sm text-steel">{booking.phone} / {booking.email}</p>
                <p className="mt-2 text-sm text-steel">{booking.address}</p>
                <div className="mt-4 grid gap-2">
                  {getBookingDetails(booking).map((detail) => (
                    <div className="rounded-lg bg-smoke px-4 py-3" key={detail.lineNumber}>
                      <p className="font-black uppercase">Detail {detail.lineNumber}: {detail.service}</p>
                      <p className="text-sm font-bold text-steel">{detail.vehicleType} / {detail.estimatedPrice}{detail.discountPercent ? ` / ${detail.discountPercent}% off` : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                <AdminActionForm bookingId={booking.id} returnTo={returnTo} />
                <form className="grid gap-2 rounded-lg bg-smoke p-3" action="/api/admin/actions" method="post">
                  <input type="hidden" name="action" value="reschedule-booking" />
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <input type="hidden" name="returnTo" value={returnTo} />
                  <input className="admin-input" name="date" type="date" defaultValue={booking.date} required />
                  <select className="admin-input" name="time" defaultValue={booking.time} required>
                    {timeSlots.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                  <button className="rounded-lg border border-ink/10 px-4 py-3 text-sm font-black uppercase" type="submit">Reschedule</button>
                </form>
              </div>
            </div>
          </article>
        )) : <p className="rounded-lg bg-white p-8 text-center font-bold text-steel ring-1 ring-ink/10">No bookings match this view.</p>}
      </section>
    </>
  );
}

function AdminActionForm({ bookingId, returnTo }: { bookingId: string; returnTo: string }) {
  return (
    <div className="grid gap-2 rounded-lg bg-smoke p-3">
      {["confirmed", "cancelled", "completed"].map((status) => (
        <form action="/api/admin/actions" method="post" key={status}>
          <input type="hidden" name="action" value="update-booking-status" />
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-black uppercase text-white" type="submit">Mark {status}</button>
        </form>
      ))}
      <form action="/api/admin/actions" method="post">
        <input type="hidden" name="action" value="resend-email" />
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button className="w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm font-black uppercase" type="submit">Resend Email</button>
      </form>
      <form action="/api/admin/actions" method="post">
        <input type="hidden" name="action" value="create-invoice" />
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button className="w-full rounded-lg bg-red px-4 py-3 text-sm font-black uppercase text-white" type="submit">Create Invoice</button>
      </form>
    </div>
  );
}
