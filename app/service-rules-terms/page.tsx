import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Service Rules & Terms | DETAILX Chicago",
  description: "Service Rules & Terms for DETAILX Chicago mobile detailing services.",
};

const sections = [
  {
    title: "Appointments and Cancellations",
    body: [
      "Customers should provide as much notice as possible if an appointment needs to be changed or cancelled. Last-minute changes may affect future scheduling priority, especially during high-demand periods.",
      "DETAILX may need to adjust appointment timing when traffic, weather, prior job conditions, or service complexity affect the schedule. We will communicate reasonable timing updates when needed.",
    ],
  },
  {
    title: "Vehicle Access and Service Readiness",
    body: [
      "The customer is responsible for providing safe access to the vehicle and the service location at the scheduled time. This includes unlocking the vehicle when needed and confirming the vehicle can be reached and worked on safely.",
      "If the service location does not allow practical or safe access, DETAILX may need to modify the service scope, reschedule the appointment, or decline service until conditions are suitable.",
    ],
  },
  {
    title: "Valuables and Personal Property",
    body: [
      "Customers should remove cash, firearms, medication, electronics, important documents, and other valuables before the appointment. DETAILX is not responsible for personal items left in the vehicle.",
      "Loose items inside the vehicle may need to be moved during service, but customers remain responsible for clearing valuable or sensitive property before arrival.",
    ],
  },
  {
    title: "Pre-Existing Damage and Vehicle Condition",
    body: [
      "DETAILX is not responsible for pre-existing damage, including worn trim, loose badges, cracked plastic, failing paint, damaged leather, stained fabric, weakened upholstery, brittle materials, or previously repaired surfaces that react unexpectedly during cleaning.",
      "Some contamination, staining, odor, scratches, oxidation, water spotting, or embedded buildup may improve significantly but cannot be guaranteed to be removed completely without additional correction work.",
    ],
  },
  {
    title: "Weather and Outdoor Service Conditions",
    body: [
      "Because DETAILX is a mobile service, weather and site conditions can affect what can be completed safely and properly. Rain, wind, extreme temperatures, poor lighting, or restricted space may require changes in timing or service scope.",
      "If weather or conditions materially affect quality or safety, DETAILX may reschedule or pause the service rather than rush the result.",
    ],
  },
  {
    title: "Service Limitations and Detailing Risks",
    body: [
      "Detailing improves condition and presentation, but it does not replace body repair, upholstery replacement, dent repair, or mechanical restoration. Some defects or wear may remain visible after service.",
      "Machine polishing, stain extraction, adhesive removal, trim cleaning, odor treatment, and deeper restoration services involve normal detailing risks depending on age, materials, prior repairs, and overall vehicle condition. DETAILX performs services with care, but some outcomes depend on the condition of the vehicle before work begins.",
    ],
  },
  {
    title: "Payment and Final Pricing",
    body: [
      "Fixed-price services follow the current posted pricing unless the customer requests additional work or the vehicle condition requires a different approved scope. Quote-based services, including premium transformation work, are confirmed after vehicle review and service planning.",
      "Payment is due according to the agreed service arrangement once the work or approved portion of work is completed, unless another written arrangement has been made in advance.",
    ],
  },
  {
    title: "Customer Photos and Service Media",
    body: [
      "DETAILX may take vehicle photos before, during, or after service for documentation, quality control, or marketing. We aim to focus on the vehicle and service result rather than personal information.",
      "If a customer does not want their vehicle used in marketing content, they should let DETAILX know before the service begins.",
    ],
  },
] as const;

export default function ServiceRulesTermsPage() {
  return (
    <main className="overflow-hidden bg-smoke">
      <Nav />
      <section className="relative overflow-hidden bg-ink px-4 pb-14 pt-28 text-white md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_24%,rgba(193,18,31,0.26),transparent_26rem)]" />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(27,29,34,0.96),rgba(5,5,6,1))]" />
        <div className="content-shell relative">
          <p className="eyebrow">Service Rules & Terms</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-none md:text-6xl">Important expectations before your appointment.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-ash">
            These service terms explain how DETAILX handles scheduling, vehicle access, condition-based detailing limits, payment, and other appointment expectations.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="content-shell grid gap-4">
          {sections.map((section) => (
            <article className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-ink/10 md:p-8" key={section.title}>
              <h2 className="text-2xl font-black uppercase leading-none text-ink md:text-3xl">{section.title}</h2>
              <div className="mt-5 grid gap-4 text-base leading-8 text-steel">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
