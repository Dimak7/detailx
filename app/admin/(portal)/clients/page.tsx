import { AdminPageHeader } from "@/components/admin/AdminShell";
import { buildAdminClients, formatMoney } from "@/lib/adminData";
import { listBookings } from "@/lib/bookingStore";

export default async function AdminClientsPage({ searchParams }: { searchParams?: Promise<{ search?: string; segment?: string }> }) {
  const params = await searchParams;
  const search = (params?.search || "").toLowerCase();
  const segment = params?.segment || "all";
  const clients = buildAdminClients(await listBookings())
    .filter((client) => !search || [client.name, client.email, client.phone, client.address].some((value) => value.toLowerCase().includes(search)))
    .filter((client) => segment === "all" || client.tags.includes(segment));

  return (
    <>
      <AdminPageHeader eyebrow="CRM" title="Clients" copy="Lightweight customer profiles generated from the shared booking history." />
      <form className="mb-5 grid gap-3 rounded-lg bg-white p-4 ring-1 ring-ink/10 md:grid-cols-[1fr_1fr_auto]" action="/admin/clients">
        <input className="admin-input" name="search" defaultValue={params?.search || ""} placeholder="Search name, phone, email, address" />
        <select className="admin-input" name="segment" defaultValue={segment}>
          <option value="all">All clients</option>
          <option value="Repeat customer">Repeat customers</option>
          <option value="No booking in 60 days">No booking in 60 days</option>
          <option value="Tint lead">Tint leads</option>
          <option value="Ceramic lead">Ceramic leads</option>
        </select>
        <button className="rounded-lg bg-ink px-5 py-3 font-black uppercase text-white" type="submit">Filter</button>
      </form>
      <section className="grid gap-4 lg:grid-cols-2">
        {clients.length ? clients.map((client) => (
          <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10" key={client.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-black uppercase leading-none">{client.name}</h2>
                <p className="mt-2 text-sm font-bold text-steel">{client.phone} / {client.email}</p>
                <p className="mt-1 text-sm text-steel">{client.address}</p>
              </div>
              <p className="rounded-lg bg-ink px-4 py-3 text-sm font-black uppercase text-white">{formatMoney(client.totalSpent)}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {client.tags.length ? client.tags.map((tag) => <span className="rounded-lg bg-red-soft px-3 py-1 text-xs font-black uppercase text-ink" key={tag}>{tag}</span>) : <span className="rounded-lg bg-smoke px-3 py-1 text-xs font-black uppercase text-steel">New customer</span>}
            </div>
            <div className="mt-4 grid gap-2 rounded-lg bg-smoke p-4 text-sm">
              <p><b>Vehicles:</b> {client.vehicles.join(", ") || "N/A"}</p>
              <p><b>Last service:</b> {client.lastServiceDate}</p>
              <p><b>Booking history:</b> {client.bookings.length} booking{client.bookings.length === 1 ? "" : "s"}</p>
            </div>
          </article>
        )) : <p className="rounded-lg bg-white p-8 text-center font-bold text-steel ring-1 ring-ink/10">No clients match this view.</p>}
      </section>
    </>
  );
}
