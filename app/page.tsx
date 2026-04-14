import Image from "next/image";
import { BookingForm } from "@/components/booking/BookingForm";
import { Nav } from "@/components/Nav";
import { galleryImages, processSteps, reasons, services, testimonials } from "@/lib/siteData";

const googleBusinessUrl = "https://share.google/KsLW0nq1eJoenaYYe";

const proofPoints = [
  ["Quality Work", "Careful details. Sharp finish."],
  ["Simple Process", "Choose a time. We come to you."],
  ["Transparent Pricing", "Clear estimates before you book."],
  ["We Save Your Time", "Premium care without the shop detour."],
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
      <Booking />
      <ProofStrip />
      <FeaturedServices />
      <Difference />
      <Gallery />
      <Process />
      <Testimonials />
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
          src="/brand/detailx-work/silver-porsche-street.jpg"
          alt="Silver Porsche on a city street for DETAILX Chicago"
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
            <a className="mt-5 inline-flex text-sm font-black uppercase text-ash transition hover:text-white" href="tel:3129299580">
              Call 3129299580
            </a>
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
    <section className="content-shell relative z-10 -mt-10 grid overflow-hidden rounded-lg border border-white/10 bg-ink text-white shadow-[0_24px_90px_rgba(5,5,6,0.34)] md:grid-cols-4">
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
            src="/brand/detailx-work/white-bmw-interior.jpg"
            alt="BMW interior after DETAILX Chicago detailing"
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
        <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Our Work</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none md:text-6xl">DETAILX Results</h2>
          </div>
          <p className="max-w-sm text-sm font-bold uppercase tracking-[0.08em] text-ash">Recent finishes, cabins, gloss, and correction work.</p>
        </div>
        <div className="flex snap-x gap-4 overflow-x-auto pb-4 md:grid md:auto-rows-[170px] md:grid-cols-6 md:overflow-visible md:pb-0">
          {galleryImages.map((image, index) => (
            <figure className={`group relative h-[320px] min-w-[78vw] snap-center overflow-hidden rounded-lg md:h-auto md:min-w-0 ${getGalleryTileClass(index)}`} key={image.src}>
              <Image src={image.src} alt={image.alt} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 768px) 40vw, 100vw" />
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
  const carouselReviews = [...testimonials, ...testimonials];

  return (
    <section className="section-pad bg-white" id="reviews">
      <div className="content-shell">
        <div className="grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="eyebrow">Reviews</p>
            <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">The kind of service people rebook.</h2>
          </div>
          <p className="text-lg leading-8 text-steel">Short notes from Chicago drivers who wanted the car handled right.</p>
        </div>
        <div className="mt-12 overflow-hidden">
          <div className="testimonial-track flex w-max gap-4">
            {carouselReviews.map((review, index) => (
            <article className="w-[290px] shrink-0 rounded-lg bg-ink p-6 text-white md:w-[360px]" key={`${review.name}-${index}`}>
              <p className="text-lg leading-8 text-ash">&quot;{review.quote}&quot;</p>
              <p className="mt-8 font-black uppercase">{review.name}</p>
              <p className="text-sm text-red">{review.neighborhood}</p>
            </article>
            ))}
          </div>
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
          <div className="mb-5 inline-flex rounded-lg border border-red/45 bg-red/15 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-red-soft">
            Add another detail - get 10% off
          </div>
          <p className="eyebrow">Reservations</p>
          <h2 className="mt-4 text-4xl font-black uppercase leading-none md:text-6xl">Choose the detail. We bring the standard.</h2>
          <p className="mt-6 leading-8 text-ash">Pick the service, vehicle size, date, and time. We handle the rest.</p>
          <div className="mt-8 grid gap-3">
            {["Quality Work", "Simple Process", "Transparent Pricing", "We Save Your Time"].map((item) => (
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
    <section className="section-pad bg-smoke">
      <div className="content-shell grid gap-6 rounded-lg bg-white p-4 shadow-[0_24px_80px_rgba(5,5,6,0.16)] ring-1 ring-ink/10 sm:p-6 md:grid-cols-[1fr_minmax(280px,360px)] md:items-center md:p-10">
        <div>
          <p className="eyebrow">Instagram</p>
          <h2 className="mt-4 text-3xl font-black uppercase leading-none sm:text-4xl md:text-5xl">More gloss, more transformations.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-steel sm:text-base">Follow @detailxchicago for recent details, coating work, paint correction results, and real Chicago mobile appointments.</p>
          <a className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-lg bg-red px-5 py-4 text-center font-black text-white transition hover:-translate-y-0.5 hover:bg-red-dark sm:w-auto" href="https://www.instagram.com/detailxchicago/" target="_blank" rel="noreferrer">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
              <rect width="16" height="16" x="4" y="4" stroke="currentColor" strokeWidth="2" rx="5" />
              <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
              <circle cx="17" cy="7" r="1" fill="currentColor" />
            </svg>
            @detailxchicago
          </a>
        </div>
        <a className="group relative min-h-[300px] overflow-hidden rounded-lg bg-ink text-white sm:min-h-[360px] md:min-h-[420px]" href="https://www.instagram.com/detailxchicago/reels/" target="_blank" rel="noreferrer" aria-label="Open DETAILX Chicago reels on Instagram">
          <Image
            src="/brand/detailx-work/detailx-instagram-audi.jpg"
            alt="DETAILX Chicago Instagram reel preview"
            fill
            className="object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
            sizes="360px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between sm:left-5 sm:right-5 sm:top-5">
            <span className="rounded-full bg-red px-3 py-1 text-xs font-black uppercase">Latest reel</span>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink transition group-hover:scale-105 sm:h-12 sm:w-12">
              <span className="ml-1 h-0 w-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-red" />
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5">
            <p className="text-xl font-black uppercase leading-none sm:text-2xl">Tap to watch the newest work.</p>
            <p className="mt-2 text-sm text-ash">Reels, finishes, details, and Chicago mobile appointments.</p>
          </div>
        </a>
      </div>
    </section>
  );
}

function getGalleryTileClass(index: number) {
  const classes = [
    "md:col-span-3 md:row-span-3",
    "md:col-span-3 md:row-span-2",
    "md:col-span-2 md:row-span-2",
    "md:col-span-2 md:row-span-3",
    "md:col-span-2 md:row-span-2",
    "md:col-span-4 md:row-span-2",
  ];

  return classes[index] ?? "md:col-span-2 md:row-span-2";
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
    <footer className="bg-ink px-4 py-10 text-white" id="contact">
      <div className="content-shell overflow-hidden rounded-lg border border-white/[0.12] bg-[linear-gradient(145deg,rgba(27,29,34,0.96),rgba(5,5,6,1))] shadow-[0_28px_110px_rgba(0,0,0,0.44)]">
        <div className="grid gap-8 p-5 md:grid-cols-[1.05fr_0.75fr_0.75fr] md:p-8">
          <div>
            <a className="inline-flex items-center gap-3 font-black uppercase" href="#top">
              <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg bg-white p-1.5 ring-1 ring-white/20">
                <Image src="/brand/detailx-logo.png" alt="DETAILX Chicago logo" width={48} height={48} className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block text-xl leading-none">DETAILX Chicago</span>
                <span className="mt-1 block text-xs font-black uppercase tracking-[0.14em] text-red">Premium mobile detailing</span>
              </span>
            </a>
            <p className="mt-6 max-w-xl text-lg font-black uppercase leading-none">Showroom-minded detailing brought to your Chicago location.</p>
            <p className="mt-4 max-w-md leading-7 text-ash">Clean booking, careful work, sharper results, and a finish that feels worth protecting.</p>
            <a className="mt-6 inline-flex rounded-lg bg-red px-6 py-4 font-black uppercase text-white transition hover:bg-red-dark" href="#booking">Book Detail</a>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-red">Contact</p>
            <div className="mt-4 grid gap-3 text-ash">
              <a className="transition hover:text-white" href="tel:3129299580">3129299580</a>
              <a className="transition hover:text-white" href="mailto:sales@detailxchicago.com">sales@detailxchicago.com</a>
              <a className="transition hover:text-white" href="https://www.instagram.com/detailxchicago/" target="_blank" rel="noreferrer">@detailxchicago</a>
              <a className="transition hover:text-white" href={googleBusinessUrl} target="_blank" rel="noreferrer">Google Business Profile</a>
              <p>Chicago service area</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-red">Explore</p>
            <nav className="mt-4 grid gap-3 text-ash">
              {[
                ["Services", "#services"],
                ["Results", "#work"],
                ["Reviews", "#reviews"],
                ["FAQ", "#faq"],
                ["Google Business", googleBusinessUrl],
              ].map(([label, href]) => (
                <a className="transition hover:text-white" href={href} key={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>{label}</a>
              ))}
            </nav>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-sm font-bold text-ash md:flex md:items-center md:justify-between md:px-8">
          <p>&copy; {new Date().getFullYear()} DETAILX Chicago. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built for premium mobile detailing in Chicago.</p>
        </div>
      </div>
    </footer>
  );
}
