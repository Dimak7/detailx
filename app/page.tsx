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
    <section className="relative min-h-screen px-4 pb-12 pt-28 text-mist md:pt-36" id="top">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=88"
          alt="Premium black performance car in dramatic light"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(12,13,11,0.94)_0%,rgba(29,33,28,0.82)_42%,rgba(12,13,11,0.26)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--mist)] to-transparent" />
      </div>
      <div className="content-shell relative grid min-h-[calc(100vh-9rem)] items-end">
        <div className="max-w-4xl pb-8">
          <p className="eyebrow">Premium mobile detailing in Chicago</p>
          <h1 className="mt-5 text-5xl font-black uppercase leading-[0.9] tracking-normal sm:text-7xl lg:text-8xl">
            Precision care for cars that deserve attention.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone">
            DETAILX Chicago brings elevated interior, exterior, coating, tint, polishing, and paint correction work to your driveway, garage, or office.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a className="rounded-lg bg-moss px-6 py-4 text-center font-black text-ink shadow-[0_18px_45px_rgba(167,181,118,0.24)] transition hover:-translate-y-0.5 hover:bg-[#b9c986]" href="#booking">
              Book Detail
            </a>
            <a className="rounded-lg border border-stone/30 bg-mist/10 px-6 py-4 text-center font-black text-mist backdrop-blur transition hover:-translate-y-0.5 hover:bg-mist/15" href="#work">
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
          <p className="font-black uppercase tracking-normal text-ink">{item}</p>
          <p className="mt-1 text-sm text-olive">Designed for polished results and convenient appointments.</p>
        </div>
      ))}
    </section>
  );
}

function Services() {
  return (
    <section className="section-pad content-shell" id="services">
      <div className="max-w-3xl">
        <p className="eyebrow">Services</p>
        <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">A refined menu for every finish.</h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <article className="motion-card rounded-lg border border-ink/10 bg-white/72 p-6 soft-ring" key={service.title}>
            <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-lg bg-graphite text-sm font-black text-mist">{service.code}</div>
            <p className="text-sm font-black uppercase text-rouge">{service.tone}</p>
            <h3 className="mt-3 text-2xl font-black uppercase leading-none text-ink">{service.title}</h3>
            <p className="mt-4 leading-7 text-olive">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="section-pad bg-graphite text-mist" id="work">
      <div className="content-shell">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="eyebrow">Our work</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Gloss, clarity, and clean interiors.</h2>
          </div>
          <p className="max-w-sm text-stone">A visual direction for ceramic glow, restored paint, premium cabins, and mobile detailing results.</p>
        </div>
        <div className="mt-12 grid auto-rows-[260px] gap-4 md:grid-cols-4">
          {galleryImages.map((image, index) => (
            <figure className={`group relative overflow-hidden rounded-lg ${index === 0 ? "md:col-span-2 md:row-span-2" : ""}`} key={image.src}>
              <Image src={image.src} alt={image.alt} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 768px) 33vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <figcaption className="absolute bottom-4 left-4 rounded-lg bg-mist/90 px-3 py-2 text-sm font-black uppercase text-ink">{image.label}</figcaption>
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
        <p className="mt-6 text-lg leading-8 text-olive">
          DETAILX Chicago started with a simple belief: premium detailing should feel as considered as the cars we work on. We bring a calm, prepared, high-standard service to Chicago homes, offices, garages, and condo buildings.
        </p>
        <p className="mt-5 text-lg leading-8 text-olive">
          Every booking is approached with respect for your time, your space, and your vehicle. We focus on the surfaces people touch, the finish people see, and the protection that keeps the result easier to maintain after we leave.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Mobile", "Protected", "Detailed"].map((item) => (
            <div className="rounded-lg bg-frost/80 p-5" key={item}>
              <p className="text-2xl font-black uppercase">{item}</p>
              <p className="mt-2 text-sm text-olive">Chicago-ready service with a premium eye.</p>
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
        <p className="mt-6 leading-8 text-olive">Trust comes from consistency. Our process is built around clean communication, careful prep, premium products, and a finish that looks right after the appointment.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reasons.map((reason) => (
          <article className="motion-card rounded-lg border border-ink/10 bg-white/70 p-6" key={reason.title}>
            <h3 className="text-xl font-black uppercase leading-none">{reason.title}</h3>
            <p className="mt-4 leading-7 text-olive">{reason.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Booking() {
  return (
    <section className="section-pad bg-[linear-gradient(135deg,var(--frost),var(--mist))]" id="booking">
      <div className="content-shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="eyebrow">Reservations</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Book a detail that actually lands.</h2>
          <p className="mt-6 leading-8 text-olive">
            Pick your service, date, time, and vehicle details. The API stores your reservation, sends an email confirmation when configured, and can send SMS through Twilio when credentials are present.
          </p>
          <div className="mt-8 rounded-lg bg-graphite p-5 text-mist">
            <p className="font-black uppercase">Backend ready</p>
            <p className="mt-2 text-sm leading-6 text-stone">PostgreSQL in production, local JSON fallback for development, Resend email, and optional Twilio SMS.</p>
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
          <article className="rounded-lg bg-white/75 p-6 soft-ring" key={review.name}>
            <p className="text-lg leading-8 text-olive">"{review.quote}"</p>
            <p className="mt-8 font-black uppercase text-ink">{review.name}</p>
            <p className="text-sm text-rouge">{review.neighborhood}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="section-pad bg-ink text-mist" id="process">
      <div className="content-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">Process</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">From booking to handoff.</h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg bg-mist/16 md:grid-cols-4">
          {processSteps.map((step) => (
            <article className="bg-graphite p-6" key={step.title}>
              <p className="text-sm font-black text-moss">{step.step}</p>
              <h3 className="mt-12 text-2xl font-black uppercase leading-none">{step.title}</h3>
              <p className="mt-4 leading-7 text-stone">{step.description}</p>
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
      <div className="glass-panel grid gap-8 rounded-lg p-6 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div>
          <p className="eyebrow">Instagram</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-5xl">More gloss, more transformations.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-olive">Follow @detailxchicago for recent details, coating work, polishing results, and real Chicago mobile appointments.</p>
        </div>
        <a className="inline-flex items-center justify-center gap-3 rounded-lg bg-graphite px-6 py-4 text-center font-black text-mist transition hover:-translate-y-0.5 hover:bg-ink" href="https://www.instagram.com/detailxchicago/" target="_blank" rel="noreferrer">
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <rect width="16" height="16" x="4" y="4" stroke="currentColor" strokeWidth="2" rx="5" />
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
            <circle cx="17" cy="7" r="1" fill="currentColor" />
          </svg>
          Follow @detailxchicago
        </a>
      </div>
    </section>
  );
}

function ContactFooter() {
  return (
    <footer className="bg-graphite px-4 py-12 text-mist" id="contact">
      <div className="content-shell grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <a className="inline-flex items-center gap-3 font-black uppercase" href="#top">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-moss text-ink">DX</span>
            DETAILX Chicago
          </a>
          <p className="mt-5 max-w-xl leading-8 text-stone">Premium mobile detailing across Chicago. Built for customers who want a cleaner, sharper, better-protected vehicle without losing the day to a shop visit.</p>
        </div>
        <div className="grid gap-3 text-stone">
          <a href="tel:+13125550148">(312) 555-0148</a>
          <a href="mailto:book@detailxchicago.com">book@detailxchicago.com</a>
          <a href="https://www.instagram.com/detailxchicago/" target="_blank" rel="noreferrer">@detailxchicago</a>
          <p>Chicago service area</p>
          <a className="mt-3 rounded-lg bg-moss px-5 py-3 text-center font-black text-ink" href="#booking">Book Detail</a>
        </div>
      </div>
    </footer>
  );
}
