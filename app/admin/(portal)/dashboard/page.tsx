import Link from "next/link";
import { AdminPageHeader, FlashMessage, StatusBadge } from "@/components/admin/AdminShell";
import { formatMoney, getBookingDetails, getDashboardMetrics } from "@/lib/adminData";
import { listBookings } from "@/lib/bookingStore";
import { listInvoices } from "@/lib/invoiceStore";

export default async function AdminDashboardPage({ searchParams }: { searchParams?: Promise<{ adminStatus?: string }> }) {
  const params = await searchParams;
  const bookings = await listBookings();
  const invoices = await listInvoices();
  const metrics = getDashboardMetrics(bookings);
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled");

  return (
    <>
      <FlashMessage status={params?.adminStatus} />
      <AdminPageHeader
        eyebrow="Operations"
        title="Dashboard"
        copy="A fast overview of today's schedule, booking status, revenue, and follow-up work."
        action={<Link className="rounded-lg bg-red px-5 py-4 text-center font-black uppercase text-white" href="/admin/schedule">Open Schedule</Link>}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Bookings this week", metrics.bookingsThisWeek],
          ["Revenue this month", formatMoney(metrics.revenueThisMonth)],
          ["Repeat customers", metrics.repeatCustomers],
          ["Average ticket", formatMoney(metrics.averageTicket)],
        ].map(([label, value]) => (
          <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10" key={label}>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-red">{label}</p>
            <p className="mt-4 text-4xl font-black uppercase leading-none">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black uppercase leading-none">Upcoming bookings</h2>
            <Link className="text-sm font-black uppercase text-red" href="/admin/bookings">View all</Link>
          </div>
          <div className="mt-5 grid gap-3">
            {metrics.upcomingBookings.length ? metrics.upcomingBookings.map((booking) => (
              <article className="rounded-lg bg-smoke p-4" key={booking.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-red">{booking.date} / {booking.time}</p>
                    <h3 className="mt-1 text-xl font-black uppercase leading-none">{booking.name}</h3>
                    <p className="mt-2 text-sm font-bold text-steel">{getBookingDetails(booking).map((detail) => `${detail.service} / ${detail.vehicleType}`).join(" + ")}</p>
                    <p className="mt-1 text-sm text-steel">{booking.address}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </article>
            )) : <p className="rounded-lg bg-smoke p-5 text-center font-bold text-steel">No upcoming bookings yet.</p>}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg bg-ink p-5 text-white shadow-sm">
            <h2 className="text-2xl font-black uppercase leading-none">Status queue</h2>
            <div className="mt-5 grid gap-3">
              <div className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3"><span>Pending</span><b>{metrics.pendingCount}</b></div>
              <div className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3"><span>Completed</span><b>{metrics.completedCount}</b></div>
              <div className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3"><span>Cancelled</span><b>{metrics.cancelledCount}</b></div>
              <div className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3"><span>Unpaid invoices</span><b>{unpaidInvoices.length}</b></div>
            </div>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10">
            <h2 className="text-2xl font-black uppercase leading-none">Recent clients</h2>
            <div className="mt-5 grid gap-3">
              {metrics.recentClients.map((client) => (
                <Link className="rounded-lg bg-smoke px-4 py-3 transition hover:bg-red-soft" href={`/admin/clients?search=${encodeURIComponent(client.email)}`} key={client.id}>
                  <p className="font-black uppercase">{client.name}</p>
                  <p className="text-sm font-bold text-steel">{client.email} / {client.bookings.length} booking{client.bookings.length === 1 ? "" : "s"}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
