import Image from "next/image";
import { BookingForm } from "@/components/booking/BookingForm";
import { Nav } from "@/components/Nav";
import { services, galleryImages, testimonials, processSteps, reasons } from "@/lib/siteData";

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Nav />
      <Hero />
      <TrustBar />
      <Services />
      <Gallery />
      <About />
      <WhyChooseUs />
      <Booking />
      <Testimonials />
      <Process />
      <Instagram />
      <ContactFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen px-4 pb-12 pt-28 text-white md:pt-36" id="top">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=88"
          alt="Premium black performance car in dramatic light"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(5,5,6,0.96)_0%,rgba(18,19,22,0.86)_42%,rgba(5,5,6,0.30)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-smoke to-transparent" />
      </div>
      <div className="content-shell relative grid min-h-[calc(100vh-9rem)] items-end">
        <div className="max-w-4xl pb-8">
          <p className="eyebrow">Premium mobile detailing in Chicago</p>
          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-normal sm:text-7xl lg:text-8xl">
            Precision care for cars that deserve attention.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ash">
            DETAILX Chicago brings elevated interior, exterior, coating, tint, polishing, and paint correction work to your driveway, garage, or office.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-lg bg-red px-6 py-4 text-center font-black text-white shadow-[0_18px_45px_rgba(193,18,31,0.32)] transition hover:-translate-y-0.5 hover:bg-red-dark" href="#booking">
              Book Detail
            </a>
            <a className="rounded-lg border border-white/25 bg-white/10 px-6 py-4 text-center font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15" href="#work">
              View Our Work
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="content-shell -mt-12 relative z-10 grid gap-3 md:grid-cols-3">
      {["Chicago mobile service", "Premium product stack", "Reliable booking flow"].map((item) => (
        <div className="glass-panel rounded-lg px-5 py-4" key={item}>
          <p className="font-black uppercase tracking-normal text-white">{item}</p>
          <p className="mt-1 text-sm text-ash">Designed for polished results and convenient appointments.</p>
        </div>
      ))}
    </section>
  );
}

function Services() {
  return (
    <section className="section-pad content-shell bg-smoke" id="services">
      <div className="max-w-3xl">
        <p className="eyebrow">Services</p>
        <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">A refined menu for every finish.</h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <article className="motion-card rounded-lg border border-ink/10 bg-white p-6 soft-ring" key={service.title}>
            <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-sm font-black text-white">{service.code}</div>
            <p className="text-sm font-black uppercase text-red">{service.tone}</p>
            <h3 className="mt-3 text-2xl font-black uppercase leading-none text-ink">{service.title}</h3>
            <p className="mt-4 leading-7 text-steel">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="section-pad bg-ink text-white" id="work">
      <div className="content-shell">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Our work</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Gloss, clarity, and clean interiors.</h2>
          </div>
          <p className="max-w-sm text-ash">A visual direction for ceramic glow, restored paint, premium cabins, and mobile detailing results.</p>
        </div>
        <div className="mt-12 grid auto-rows-[260px] gap-4 md:grid-cols-4">
          {galleryImages.map((image, index) => (
            <figure className={`group relative overflow-hidden rounded-lg ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`} key={image.src}>
              <Image src={image.src} alt={image.alt} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 768px) 33vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <figcaption className="absolute bottom-4 left-4 rounded-lg bg-white/95 px-3 py-2 text-sm font-black uppercase text-ink ring-2 ring-red/80">{image.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section-pad content-shell grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]" id="about">
      <div className="relative min-h-[440px] overflow-hidden rounded-lg soft-ring">
        <Image
          src="https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=1400&q=88"
          alt="Detailing work on a premium vehicle"
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 45vw, 100vw"
        />
      </div>
      <div>
        <p className="eyebrow">About DETAILX Chicago</p>
        <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Built for drivers who notice the small things.</h2>
        <p className="mt-6 text-lg leading-8 text-steel">
          DETAILX Chicago started with a simple belief: premium detailing should feel as considered as the cars we work on. We bring a calm, prepared, high-standard service to Chicago homes, offices, garages, and condo buildings.
        </p>
        <p className="mt-5 text-lg leading-8 text-steel">
          Every booking is approached with respect for your time, your space, and your vehicle. We focus on the surfaces people touch, the finish people see, and the protection that keeps the result easier to maintain after we leave.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Mobile", "Protected", "Detailed"].map((item) => (
            <div className="rounded-lg bg-white p-5 ring-1 ring-ink/10" key={item}>
              <p className="text-2xl font-black uppercase">{item}</p>
              <p className="mt-2 text-sm text-steel">Chicago-ready service with a premium eye.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  return (
    <section className="section-pad content-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]" id="why">
      <div>
        <p className="eyebrow">Why choose us</p>
        <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">A sharper standard for mobile care.</h2>
        <p className="mt-6 leading-8 text-steel">Trust comes from consistency. Our process is built around clean communication, careful prep, premium products, and a finish that looks right after the appointment.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reasons.map((reason) => (
          <article className="motion-card rounded-lg border border-ink/10 bg-white p-6" key={reason.title}>
            <h3 className="text-xl font-black uppercase leading-none">{reason.title}</h3>
            <p className="mt-4 leading-7 text-steel">{reason.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Booking() {
  return (
    <section className="section-pad bg-[linear-gradient(135deg,var(--ink),var(--charcoal))] text-white" id="booking">
      <div className="content-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="eyebrow">Reservations</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Book a detail that actually lands.</h2>
          <p className="mt-6 leading-8 text-ash">
            Pick your service, date, time, and vehicle details. The API stores your reservation, sends an email confirmation when configured, and can send SMS through Twilio when credentials are present.
          </p>
          <div className="mt-8 rounded-lg border border-white/[0.12] bg-white/[0.08] p-5 text-white">
            <p className="font-black uppercase">Backend ready</p>
            <p className="mt-2 text-sm leading-6 text-ash">PostgreSQL in production, local JSON fallback for development, Resend email, and optional Twilio SMS.</p>
          </div>
        </div>
        <BookingForm services={services.map((service) => service.title)} />
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section-pad content-shell" id="reviews">
      <div className="max-w-3xl">
        <p className="eyebrow">Reviews</p>
        <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Trusted by Chicago drivers.</h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {testimonials.map((review) => (
          <article className="rounded-lg bg-white p-6 soft-ring" key={review.name}>
            <p className="text-lg leading-8 text-steel">"{review.quote}"</p>
            <p className="mt-8 font-black uppercase text-ink">{review.name}</p>
            <p className="text-sm text-red">{review.neighborhood}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="section-pad bg-ink text-white" id="process">
      <div className="content-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">Process</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">From booking to handoff.</h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg bg-white/[0.16] md:grid-cols-4">
          {processSteps.map((step) => (
            <article className="bg-charcoal p-6" key={step.title}>
              <p className="text-sm font-black text-red">{step.step}</p>
              <h3 className="mt-12 text-2xl font-black uppercase leading-none">{step.title}</h3>
              <p className="mt-4 leading-7 text-ash">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Instagram() {
  return (
    <section className="section-pad content-shell">
      <div className="grid gap-8 rounded-lg bg-white p-6 shadow-[0_24px_80px_rgba(5,5,6,0.16)] ring-1 ring-ink/10 md:grid-cols-[1fr_360px] md:items-center md:p-10">
        <div>
          <p className="eyebrow">Instagram</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-5xl">More gloss, more transformations.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-steel">Follow @detailxchicago for recent details, coating work, polishing results, and real Chicago mobile appointments.</p>
          <a className="mt-7 inline-flex items-center justify-center gap-3 rounded-lg bg-red px-6 py-4 text-center font-black text-white transition hover:-translate-y-0.5 hover:bg-red-dark" href="https://www.instagram.com/detailxchicago/" target="_blank" rel="noreferrer">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <rect width="16" height="16" x="4" y="4" stroke="currentColor" strokeWidth="2" rx="5" />
              <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
              <circle cx="17" cy="7" r="1" fill="currentColor" />
            </svg>
            @detailxchicago
          </a>
        </div>
        <a className="group relative min-h-[420px] overflow-hidden rounded-lg bg-ink text-white" href="https://www.instagram.com/detailxchicago/reels/" target="_blank" rel="noreferrer" aria-label="Open DETAILX Chicago reels on Instagram">
          <Image
            src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=88"
            alt="Luxury vehicle reel preview"
            fill
            className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            sizes="360px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
            <span className="rounded-full bg-red px-3 py-1 text-xs font-black uppercase">Latest reel</span>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-ink transition group-hover:scale-105">
              <span className="ml-1 h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-red" />
            </span>
          </div>
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-2xl font-black uppercase leading-none">Tap to watch the newest work.</p>
            <p className="mt-2 text-sm text-ash">Reels, finishes, details, and Chicago mobile appointments.</p>
          </div>
        </a>
      </div>
    </section>
  );
}

function ContactFooter() {
  return (
    <footer className="bg-ink px-4 py-12 text-white" id="contact">
      <div className="content-shell grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <a className="inline-flex items-center gap-3 font-black uppercase" href="#top">
            <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-white/20">
              <Image src="/brand/detailx-logo.png" alt="DETAILX Chicago logo" width={48} height={48} className="h-full w-full object-contain" />
            </span>
            DETAILX Chicago
          </a>
          <p className="mt-5 max-w-xl leading-8 text-ash">Premium mobile detailing across Chicago. Built for customers who want a cleaner, sharper, better-protected vehicle without losing the day to a shop visit.</p>
        </div>
        <div className="grid gap-3 text-ash">
          <a href="tel:+13125550148">(312) 555-0148</a>
          <a href="mailto:book@detailxchicago.com">book@detailxchicago.com</a>
          <a href="https://www.instagram.com/detailxchicago/" target="_blank" rel="noreferrer">@detailxchicago</a>
          <p>Chicago service area</p>
          <a className="mt-3 rounded-lg bg-red px-5 py-3 text-center font-black text-white transition hover:bg-red-dark" href="#booking">Book Detail</a>
        </div>
      </div>
    </footer>
  );
}
