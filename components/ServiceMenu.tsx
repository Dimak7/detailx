"use client";

import { useState } from "react";

type ServiceMenuItem = {
  title: string;
  code: string;
  tone: string;
  description: string;
  price: string;
  includes: readonly string[];
};

export function ServiceMenu({ services }: { services: readonly ServiceMenuItem[] }) {
  const [openService, setOpenService] = useState<string | null>(services[0]?.title ?? null);

  return (
    <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service, index) => {
        const isFeatured = index === 0;
        const isOpen = openService === service.title;

        return (
          <article className={`motion-card rounded-lg p-5 ${isFeatured ? "bg-ink text-white" : "bg-white text-ink soft-ring"}`} key={service.title}>
            <div className="flex items-start justify-between gap-4">
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg text-sm font-black ${isFeatured ? "bg-red text-white" : "bg-ink text-white"}`}>
                {service.code}
              </div>
              <p className={`rounded-lg px-3 py-2 text-sm font-black uppercase ${isFeatured ? "bg-white text-ink" : "bg-red-soft text-red"}`}>{service.price}</p>
            </div>
            <p className="mt-8 text-sm font-black uppercase text-red">{service.tone}</p>
            <h3 className="mt-3 text-2xl font-black uppercase leading-none">{service.title}</h3>
            <p className={`mt-4 text-sm leading-7 ${isFeatured ? "text-ash" : "text-steel"}`}>{service.description}</p>

            <button
              aria-expanded={isOpen}
              className={`mt-5 flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left text-sm font-black uppercase transition ${
                isFeatured ? "border-white/15 bg-white/[0.06] hover:bg-white/[0.1]" : "border-ink/10 bg-smoke hover:border-red/35"
              }`}
              onClick={() => setOpenService(isOpen ? null : service.title)}
              type="button"
            >
              <span>What&apos;s included</span>
              <span className={`grid h-8 w-8 place-items-center rounded-md bg-red text-lg leading-none text-white transition duration-300 ${isOpen ? "rotate-45" : ""}`}>+</span>
            </button>

            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <ul className={`mt-4 grid gap-3 rounded-lg border p-4 text-sm leading-6 ${isFeatured ? "border-white/10 bg-white/[0.04] text-ash" : "border-ink/10 bg-smoke text-steel"}`}>
                  {service.includes.map((item) => (
                    <li className="flex gap-3" key={item}>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
