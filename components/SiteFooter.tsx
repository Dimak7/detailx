import Image from "next/image";

const googleBusinessUrl = "https://share.google/KsLW0nq1eJoenaYYe";

const footerLinks = [
  ["Services", "/#services"],
  ["Results", "/#work"],
  ["Reviews", "/#reviews"],
  ["FAQ", "/#faq"],
  ["Privacy Policy", "/privacy-policy"],
  ["Service Rules & Terms", "/service-rules-terms"],
  ["Google Business", googleBusinessUrl],
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-ink px-4 py-10 text-white" id="contact">
      <div className="content-shell overflow-hidden rounded-lg border border-white/[0.12] bg-[linear-gradient(145deg,rgba(27,29,34,0.96),rgba(5,5,6,1))] shadow-[0_28px_110px_rgba(0,0,0,0.44)]">
        <div className="grid gap-8 p-5 md:grid-cols-[1.05fr_0.75fr_0.75fr] md:p-8">
          <div>
            <a className="inline-flex items-center gap-3 font-black uppercase" href="/#top">
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
            <a className="mt-6 inline-flex rounded-lg bg-red px-6 py-4 font-black uppercase text-white transition hover:bg-red-dark" href="/#booking">Book Detail</a>
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
              {footerLinks.map(([label, href]) => (
                <a className="transition hover:text-white" href={href} key={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-4 text-sm font-bold text-ash md:flex md:items-center md:justify-between md:px-8">
          <p>&copy; {new Date().getFullYear()} DETAILX Chicago. All rights reserved.</p>
          <div className="mt-2 flex flex-col gap-2 md:mt-0 md:flex-row md:items-center md:gap-5">
            <a className="transition hover:text-white" href="/privacy-policy">Privacy Policy</a>
            <a className="transition hover:text-white" href="/service-rules-terms">Service Rules & Terms</a>
            <p>Built for premium mobile detailing in Chicago.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
