import Link from "next/link";

export default async function AdminLoginPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red">DETAILX Chicago</p>
        <h1 className="mt-3 text-4xl font-black uppercase leading-none">Admin Login</h1>
        <p className="mt-4 text-sm leading-6 text-ash">Access the internal operations portal for schedule, bookings, clients, and invoices.</p>
        {params?.error ? <p className="mt-4 rounded-lg bg-red-soft px-4 py-3 text-sm font-black text-ink">Invalid admin credentials.</p> : null}
        <form className="mt-6 grid gap-4" action="/api/admin/login" method="post">
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-ash">
            Email
            <input className="min-h-12 rounded-lg border border-white/15 bg-white px-4 text-ink outline-none" name="email" type="email" required />
          </label>
          <label className="grid gap-2 text-xs font-black uppercase tracking-[0.12em] text-ash">
            Password
            <input className="min-h-12 rounded-lg border border-white/15 bg-white px-4 text-ink outline-none" name="password" type="password" required />
          </label>
          <button className="rounded-lg bg-red px-5 py-4 font-black uppercase text-white transition hover:bg-red-dark" type="submit">
            Sign In
          </button>
        </form>
        <Link className="mt-5 inline-flex text-sm font-black uppercase text-ash hover:text-white" href="/">
          Back to public site
        </Link>
      </section>
    </main>
  );
}
