"use client";

import Image from "next/image";
import { useState } from "react";

const navItems = [
  ["Services", "#services"],
  ["Our Work", "#work"],
  ["About", "#about"],
  ["Reviews", "#reviews"],
  ["Contact", "#contact"],
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 py-3">
      <nav className="content-shell flex items-center justify-between rounded-lg border border-white/[0.12] bg-ink/[0.82] px-3 py-3 text-white shadow-2xl backdrop-blur-xl">
        <a className="flex items-center gap-3 font-black uppercase" href="#top" onClick={() => setOpen(false)}>
          <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg bg-white p-1 ring-1 ring-white/20">
            <Image src="/brand/detailx-logo.png" alt="DETAILX Chicago logo" width={44} height={44} className="h-full w-full object-contain" priority />
          </span>
          <span className="tracking-normal">DETAILX Chicago</span>
        </a>
        <button className="rounded-lg border border-white/20 px-3 py-2 md:hidden" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
        <div className="hidden items-center gap-6 text-sm font-bold text-ash md:flex">
          {navItems.map(([label, href]) => (
            <a className="transition hover:text-white" href={href} key={href}>
              {label}
            </a>
          ))}
          <a className="rounded-lg bg-red px-4 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-red-dark" href="#booking">
            Book Detail
          </a>
        </div>
      </nav>
      {open ? (
        <div className="content-shell mt-2 grid gap-1 rounded-lg border border-white/15 bg-ink p-3 text-white shadow-2xl md:hidden" id="mobile-menu">
          {navItems.map(([label, href]) => (
            <a className="rounded-lg px-3 py-3 font-bold text-ash hover:bg-white/10 hover:text-white" href={href} key={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a className="rounded-lg bg-red px-3 py-3 text-center font-black text-white" href="#booking" onClick={() => setOpen(false)}>
            Book Detail
          </a>
        </div>
      ) : null}
    </header>
  );
}
