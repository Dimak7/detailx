import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy | DETAILX Chicago",
  description: "Privacy Policy for DETAILX Chicago mobile detailing services.",
};

const sections = [
  {
    title: "Information We Collect",
    body: [
      "When you request a booking or quote, DETAILX may collect your name, phone number, email address, service location, vehicle details, requested service, preferred date and time, and any notes you choose to provide.",
      "We may also keep records of booking confirmations, customer communication, invoices, and service history so we can support your appointment and follow-up service needs.",
    ],
  },
  {
    title: "How We Use Information",
    body: [
      "We use customer information to schedule and provide detailing services, confirm appointments, respond to quote requests, send service-related communication, process payments or invoices, and improve customer support.",
      "Information may also be used for internal business operations such as availability planning, service records, pricing administration, and quality follow-up after an appointment.",
    ],
  },
  {
    title: "How Information Is Shared",
    body: [
      "DETAILX may share limited customer information with trusted service providers that help us operate the business, such as booking, email, messaging, payment, hosting, or database tools.",
      "These providers only receive the information needed to perform their function for DETAILX and are not authorized to use it for unrelated purposes.",
    ],
  },
  {
    title: "No Sale of Personal Information",
    body: [
      "DETAILX does not sell personal information. Customer contact details, service history, and booking information are used only to operate and support DETAILX services.",
    ],
  },
  {
    title: "Data Security and Retention",
    body: [
      "We take reasonable steps to protect stored customer information through the tools and systems used to operate the business. No online platform can promise absolute security, but DETAILX aims to limit access to authorized business use only.",
      "Information may be retained as long as reasonably necessary for bookings, service history, follow-up support, legal obligations, recordkeeping, or dispute resolution.",
    ],
  },
  {
    title: "Your Choices",
    body: [
      "You can ask us to update or correct contact information you previously submitted. You may also request that we stop non-essential follow-up communication.",
      "If you have privacy questions or would like to request changes to your information, contact DETAILX using the business contact details listed on this website.",
    ],
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <main className="overflow-hidden bg-smoke">
      <Nav />
      <section className="relative overflow-hidden bg-ink px-4 pb-14 pt-28 text-white md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(193,18,31,0.28),transparent_28rem)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(5,5,6,0.96),rgba(27,29,34,0.92))]" />
        <div className="content-shell relative">
          <p className="eyebrow">Privacy Policy</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black uppercase leading-none md:text-6xl">How DETAILX handles customer information.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-ash">
            This policy explains what information DETAILX collects, how it is used to provide mobile detailing services, and how customer information is handled with care.
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
