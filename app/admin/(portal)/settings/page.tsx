import { AdminPageHeader } from "@/components/admin/AdminShell";
import { pricedServices } from "@/lib/pricing";
import { timeSlots } from "@/lib/schedule";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Config" title="Settings" copy="Operational defaults used by the current booking flow. Environment variables still control secrets and integrations." />
      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10">
          <h2 className="text-2xl font-black uppercase leading-none">Business hours</h2>
          <p className="mt-3 text-sm leading-6 text-steel">Public booking currently uses fixed slots:</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {timeSlots.map((slot) => <span className="rounded-lg bg-smoke px-3 py-2 text-sm font-black" key={slot}>{slot}</span>)}
          </div>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10">
          <h2 className="text-2xl font-black uppercase leading-none">Service defaults</h2>
          <div className="mt-4 grid gap-2">
            {pricedServices.map((service) => (
              <div className="rounded-lg bg-smoke px-4 py-3" key={service.title}>
                <p className="font-black uppercase">{service.title}</p>
                <p className="text-sm text-steel">Shown in booking flow and admin estimates.</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-ink/10 lg:col-span-2">
          <h2 className="text-2xl font-black uppercase leading-none">Integration setup</h2>
          <div className="mt-4 grid gap-2 text-sm font-bold text-steel md:grid-cols-2">
            <p>Admin auth: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET</p>
            <p>Email: RESEND_API_KEY, BUSINESS_EMAIL, EMAIL_FROM</p>
            <p>Payments: STRIPE_SECRET_KEY</p>
            <p>Database: DATABASE_URL, DATABASE_SSL</p>
          </div>
        </article>
      </section>
    </>
  );
}
