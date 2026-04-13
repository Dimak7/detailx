import Image from "next/image";
import { BookingForm } from "@/components/booking/BookingForm";
import { Nav } from "@/components/Nav";
import { galleryImages, processSteps, reasons, services, testimonials } from "@/lib/siteData";

const proofPoints = [
  ["Chicago mobile", "Homes, garages, offices, and approved parking locations."],
  ["Paint-conscious process", "Prep, product choice, and final inspection matter."],
  ["Backend booking", "Reservations are saved with email and optional SMS support."],
];

const faqItems = [
  ["Do you service all of Chicago?", "DETAILX Chicago serves Chicago neighborhoods and can review nearby suburb requests based on schedule and setup."],
  ["Do I need to provide water or power?", "We confirm site needs before the appointment so your location is set up for the service you choose."],
  ["How long does a detail take?", "Most appointments run 2 to 5 hours depending on vehicle size, condition, and service level."],
  ["Can I book coating or paint correction online?", "Yes. Start with the reservation form and we will confirm the prep level, timing, and final scope before work begins."],
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-smoke">
      <Nav />
      <Hero />
      <ProofStrip />
      <FeaturedServices />
      <Difference />
      <Gallery />
      <Process />
      <Testimonials />
      <Booking />
      <Instagram />
      <Faq />
      <ContactFooter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 pb-16 pt-28 text-white md:pt-36" id="top">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1900&q=90"
          alt="Luxury performance car in a dramatic setting"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(5,5,6,0.97)_0%,rgba(5,5,6,0.88)_42%,rgba(5,5,6,0.32)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(193,18,31,0.34),transparent_28rem)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-smoke to-transparent" />
      </div>

      <div className="content-shell relative grid min-h-[calc(100vh-9rem)] items-end">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="max-w-5xl pb-4">
            <p className="eyebrow">DETAILX Chicago / premium mobile detailing</p>
            <h1 className="mt-5 max-w-5xl text-5xl font-black uppercase leading-[0.86] tracking-normal sm:text-7xl lg:text-8xl">
              Most cars get washed. Yours gets detailed.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-ash md:text-xl">
              We bring a sharper, more careful detailing experience to your driveway, garage, or office, built for Chicago drivers who want the finish without wasting the day.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="rounded-lg bg-red px-7 py-4 text-center font-black text-white shadow-[0_20px_55px_rgba(193,18,31,0.38)] transition hover:-translate-y-0.5 hover:bg-red-dark" href="#booking">
                Book Detail
              </a>
              <a className="rounded-lg border border-white/25 bg-white/10 px-7 py-4 text-center font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/[0.15]" href="#work">
                View Our Work
              </a>
            </div>
          </div>

          <aside className="rounded-lg border border-white/[0.14] bg-ink/[0.72] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-sm font-black uppercase text-red">Why it feels different</p>
            <p className="mt-4 text-2xl font-black uppercase leading-none">No waiting room. No rushed tunnel wash. No guesswork.</p>
            <div className="mt-6 grid gap-3">
              {["Interior reset", "Gloss and paint clarity", "Protection-minded handoff"].map((item) => (
                <div className="flex items-center gap-3 border-t border-white/10 pt-3" key={item}>
                  <span className="h-2 w-2 rounded-full bg-red" />
                  <span className="text-sm font-bold text-ash">{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function ProofStrip() {
  return (
    <section className="content-shell relative z-10 -mt-10 grid overflow-hidden rounded-lg border border-white/10 bg-ink text-white shadow-[0_24px_90px_rgba(5,5,6,0.34)] md:grid-cols-3">
      {proofPoints.map(([title, description]) => (
        <article className="border-white/10 p-6 md:border-r md:last:border-r-0" key={title}>
          <p className="font-black uppercase">{title}</p>
          <p className="mt-2 text-sm leading-6 text-ash">{description}</p>
        </article>
      ))}
    </section>
  );
}

function FeaturedServices() {
  const featured = services.slice(0, 4);

  return (
    <section className="section-pad content-shell" id="services">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="eyebrow">Featured services</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Start with the finish you want back.</h2>
        </div>
        <p className="max-w-2xl text-lg leading-8 text-steel">
          The menu is simple on purpose: clean the cabin, sharpen the exterior, correct the finish, protect the result, and make it easy to book.
        </p>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-4">
        {featured.map((service, index) => (
          <article className={`motion-card rounded-lg p-6 ${index === 0 ? "bg-ink text-white" : "bg-white text-ink soft-ring"}`} key={service.title}>
            <div className={`mb-12 flex h-12 w-12 items-center justify-center rounded-lg text-sm font-black ${index === 0 ? "bg-red text-white" : "bg-ink text-white"}`}>{service.code}</div>
            <p className="text-sm font-black uppercase text-red">{service.tone}</p>
            <h3 className="mt-3 text-2xl font-black uppercase leading-none">{service.title}</h3>
            <p className={`mt-4 leading-7 ${index === 0 ? "text-ash" : "text-steel"}`}>{service.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {services.slice(4).map((service) => (
          <article className="rounded-lg border border-ink/10 bg-white px-5 py-4" key={service.title}>
            <p className="text-sm font-black uppercase text-red">{service.title}</p>
            <p className="mt-2 text-sm text-steel">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Difference() {
  return (
    <section className="section-pad bg-white" id="about">
      <div className="content-shell grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative min-h-[560px] overflow-hidden rounded-lg bg-ink">
          <Image
            src="https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=1400&q=90"
            alt="Detailing work on a premium vehicle"
            fill
            className="object-cover opacity-[0.88]"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/[0.15] bg-ink/80 p-5 text-white backdrop-blur">
            <p className="text-sm font-black uppercase text-red">Service area</p>
            <p className="mt-2 text-2xl font-black uppercase leading-none">Chicago homes, garages, offices, and condo buildings.</p>
          </div>
        </div>

        <div>
          <p className="eyebrow">The DETAILX difference</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Built for people who can spot a shortcut.</h2>
          <p className="mt-6 text-lg leading-8 text-steel">
            DETAILX Chicago is for drivers who care how their car feels when they open the door, how the paint reads in daylight, and how easy it is to maintain after the appointment.
          </p>
          <div className="mt-8 grid gap-4">
            {reasons.map((reason) => (
              <article className="grid gap-4 rounded-lg border border-ink/10 bg-smoke p-5 md:grid-cols-[180px_1fr]" key={reason.title}>
                <h3 className="font-black uppercase leading-none text-ink">{reason.title}</h3>
                <p className="leading-7 text-steel">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  return (
    <section className="section-pad bg-ink text-white" id="work">
      <div className="content-shell">
        <div className="grid gap-6 md:grid-cols-[1fr_0.7fr] md:items-end">
          <div>
            <p className="eyebrow">Results</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Proof belongs in the finish.</h2>
          </div>
          <p className="text-ash">Use this gallery direction for real DETAILX work as the brand grows: interiors, paint clarity, ceramic-ready gloss, and before/after transformations.</p>
        </div>
        <div className="mt-12 grid auto-rows-[250px] gap-4 md:grid-cols-5">
          {galleryImages.map((image, index) => (
            <figure className={`group relative overflow-hidden rounded-lg ${index === 0 ? "md:col-span-3 md:row-span-2" : "md:col-span-2"}`} key={image.src}>
              <Image src={image.src} alt={image.alt} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 768px) 40vw, 100vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/[0.85] via-ink/10 to-transparent" />
              <figcaption className="absolute bottom-4 left-4 rounded-lg bg-white px-3 py-2 text-sm font-black uppercase text-ink ring-2 ring-red">{image.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="section-pad bg-smoke" id="process">
      <div className="content-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">Process</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">A premium detail without the shop detour.</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {processSteps.map((step) => (
            <article className="rounded-lg bg-white p-6 soft-ring" key={step.title}>
              <p className="text-sm font-black text-red">{step.step}</p>
              <h3 className="mt-14 text-2xl font-black uppercase leading-none">{step.title}</h3>
              <p className="mt-4 leading-7 text-steel">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section-pad bg-white" id="reviews">
      <div className="content-shell">
        <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">The kind of service people rebook.</h2>
          </div>
          <p className="text-lg leading-8 text-steel">Real trust is built before, during, and after the detail: clear booking, careful work, clean handoff.</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {testimonials.map((review) => (
            <article className="rounded-lg bg-ink p-6 text-white" key={review.name}>
              <p className="text-lg leading-8 text-ash">"{review.quote}"</p>
              <p className="mt-10 font-black uppercase">{review.name}</p>
              <p className="text-sm text-red">{review.neighborhood}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Booking() {
  return (
    <section className="section-pad bg-[linear-gradient(135deg,var(--ink),var(--charcoal))] text-white" id="booking">
      <div className="content-shell grid gap-10 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <p className="eyebrow">Reservations</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Choose the detail. We bring the standard.</h2>
          <p className="mt-6 leading-8 text-ash">
            Choose the service, vehicle size, date, and time. Pricing updates as you build the reservation, then the backend saves your request and sends confirmation through Resend.
          </p>
          <div className="mt-8 grid gap-3">
            {["Live price estimate", "Resend email confirmation", "Telegram admin alert"].map((item) => (
              <div className="rounded-lg border border-white/[0.12] bg-white/[0.08] px-4 py-3 text-sm font-black uppercase" key={item}>{item}</div>
            ))}
          </div>
        </div>
        <BookingForm />
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
          <p className="mt-5 max-w-2xl leading-8 text-steel">Follow @detailxchicago for recent details, coating work, paint correction results, and real Chicago mobile appointments.</p>
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

function Faq() {
  return (
    <section className="section-pad bg-smoke" id="faq">
      <div className="content-shell grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="eyebrow">FAQ</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Questions before you book.</h2>
        </div>
        <div className="grid gap-3">
          {faqItems.map(([question, answer]) => (
            <details className="rounded-lg bg-white p-5 ring-1 ring-ink/10" key={question}>
              <summary className="cursor-pointer font-black uppercase text-ink">{question}</summary>
              <p className="mt-4 leading-7 text-steel">{answer}</p>
            </details>
          ))}
        </div>
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
          <a href="mailto:sales@detailxchicago.com">sales@detailxchicago.com</a>
          <a href="https://www.instagram.com/detailxchicago/" target="_blank" rel="noreferrer">@detailxchicago</a>
          <p>Chicago service area</p>
          <a className="mt-3 rounded-lg bg-red px-5 py-3 text-center font-black text-white transition hover:bg-red-dark" href="#booking">Book Detail</a>
        </div>
      </div>
    </footer>
  );
}
