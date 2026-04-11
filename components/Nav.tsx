"use client";

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
      <nav className="content-shell flex items-center justify-between rounded-lg border border-mist/20 bg-ink/72 px-3 py-3 text-mist shadow-2xl backdrop-blur-xl">
        <a className="flex items-center gap-3 font-black uppercase" href="#top" onClick={() => setOpen(false)}>
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-moss text-ink">DX</span>
          <span>DETAILX Chicago</span>
        </a>
        <button className="rounded-lg border border-mist/20 px-3 py-2 md:hidden" type="button" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((value) => !value)}>
          Menu
        </button>
        <div className="hidden items-center gap-6 text-sm font-bold text-stone md:flex">
          {navItems.map(([label, href]) => (
            <a className="transition hover:text-mist" href={href} key={href}>
              {label}
            </a>
          ))}
          <a className="rounded-lg bg-moss px-4 py-3 font-black text-ink transition hover:bg-[#b9c986]" href="#booking">
            Book Detail
          </a>
        </div>
      </nav>
      {open ? (
        <div className="content-shell mt-2 grid gap-1 rounded-lg border border-mist/15 bg-ink p-3 text-mist shadow-2xl md:hidden" id="mobile-menu">
          {navItems.map(([label, href]) => (
            <a className="rounded-lg px-3 py-3 font-bold text-stone hover:bg-mist/10 hover:text-mist" href={href} key={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a className="rounded-lg bg-moss px-3 py-3 text-center font-black text-ink" href="#booking" onClick={() => setOpen(false)}>
            Book Detail
          </a>
        </div>
      ) : null}
    </header>
  );
}
