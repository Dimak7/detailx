import Link from "next/link";
import { AdminPageHeader, FlashMessage, StatusBadge } from "@/components/admin/AdminShell";
import { formatMoney, getBookingDetails, getDashboardAnalytics, getDashboardMetrics } from "@/lib/adminData";
import { listBookings } from "@/lib/bookingStore";
import { getBusinessMetricsSettings } from "@/lib/businessMetricsStore";
import { listInvoices } from "@/lib/invoiceStore";

const timelineOptions = [7, 30, 60, 90] as const;

export default async function AdminDashboardPage({ searchParams }: { searchParams?: Promise<{ adminStatus?: string; adminMessage?: string; range?: string }> }) {
  const params = await searchParams;
  const days = parseTimelineRange(params?.range);
  const bookings = await listBookings();
  const invoices = await listInvoices();
  const businessSettings = await getBusinessMetricsSettings();
  const metrics = getDashboardMetrics(bookings);
  const analytics = getDashboardAnalytics(bookings, { days, marketingExpense: businessSettings.marketingExpense });
  const unpaidInvoices = invoices.filter((invoice) => invoice.status !== "paid" && invoice.status !== "cancelled");

  return (
    <>
      <FlashMessage status={params?.adminStatus} message={params?.adminMessage} />
      <AdminPageHeader
        eyebrow="Operations"
        title="Dashboard"
        copy="A fast overview of today's schedule, booking status, revenue, and follow-up work."
        action={<Link className="rounded-lg bg-red px-5 py-4 text-center font-black uppercase text-white" href="/admin/schedule">Open Schedule</Link>}
      />

      <section className="mb-5 flex flex-wrap gap-2">
        {timelineOptions.map((option) => (
          <Link
            className={`rounded-lg px-4 py-3 text-sm font-black uppercase ${days === option ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/10"}`}
            href={`/admin/dashboard?range=${option}`}
            key={option}
          >
            {option} days
          </Link>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total revenue", formatMoney(analytics.revenue)],
          ["Total clients", analytics.totalClients],
          ["Profit", formatMoney(analytics.profit)],
          ["Marketing expense", formatMoney(analytics.marketingExpense)],
        ].map(([label, value]) => (
          <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10" key={label}>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-red">{label}</p>
            <p className="mt-4 text-4xl font-black uppercase leading-none">{value}</p>
            <p className="mt-3 text-xs font-bold uppercase text-steel">{analytics.rangeStart} / {analytics.rangeEnd}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg bg-ink p-5 text-white shadow-sm xl:col-span-2">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-red">Revenue trend</p>
              <h2 className="mt-2 text-3xl font-black uppercase leading-none">{days}-day performance</h2>
            </div>
            <form className="grid gap-2 rounded-lg bg-white/10 p-3 md:grid-cols-[180px_auto]" action="/api/admin/actions" method="post">
              <input type="hidden" name="action" value="update-business-metrics" />
              <input type="hidden" name="returnTo" value={`/admin/dashboard?range=${days}`} />
              <input className="admin-input" name="marketingExpense" type="number" min="0" step="1" defaultValue={analytics.marketingExpense} aria-label="Marketing expense" />
              <button className="rounded-lg bg-red px-4 py-3 text-sm font-black uppercase text-white" type="submit">Save marketing</button>
            </form>
          </div>
          <div className="mt-6 overflow-hidden rounded-lg bg-white/[0.06] p-3">
            <RevenueChart series={analytics.series} />
          </div>
        </div>

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

function parseTimelineRange(value?: string) {
  const parsed = Number(value || 30);
  return timelineOptions.includes(parsed as (typeof timelineOptions)[number]) ? parsed : 30;
}

function RevenueChart({ series }: { series: Array<{ date: string; revenue: number; bookings: number }> }) {
  const width = 900;
  const height = 260;
  const maxRevenue = Math.max(1, ...series.map((point) => point.revenue));
  const points = series.map((point, index) => {
    const x = series.length === 1 ? width : (index / (series.length - 1)) * width;
    const y = height - (point.revenue / maxRevenue) * (height - 28) - 14;
    return { ...point, x, y };
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg className="h-64 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue trend chart" preserveAspectRatio="none">
      <defs>
        <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c1121f" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#c1121f" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((line) => (
        <line key={line} x1="0" x2={width} y1={(height / 4) * line + 8} y2={(height / 4) * line + 8} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      ))}
      <polygon points={`0,${height} ${polyline} ${width},${height}`} fill="url(#revenueFill)" />
      <polyline fill="none" points={polyline} stroke="#c1121f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
      {points.filter((_, index) => index % Math.max(1, Math.ceil(points.length / 8)) === 0 || index === points.length - 1).map((point) => (
        <g key={point.date}>
          <circle cx={point.x} cy={point.y} fill="#ffffff" r="5" />
          <text fill="#c7c9c7" fontSize="18" fontWeight="800" textAnchor="middle" x={point.x} y={height - 8}>{point.date.slice(5)}</text>
        </g>
      ))}
    </svg>
  );
}
