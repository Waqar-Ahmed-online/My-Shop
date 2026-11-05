"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import Container from "./Container";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartButton from "./CartButton";
import type { FanCard } from "@/types";

const otherLinks = ["Deals", "About Us", "Contact"];

// "SK FAN" -> "SK"
const brandOf = (label: string) => label.replace(/\s*fans?\s*$/i, "").trim() || label;

export default function HeaderClient({ cards }: { cards: FanCard[] }) {
  const [open, setOpen] = useState(false); // mobile menu
  const [colOpen, setColOpen] = useState(false); // mobile mein Collection kholna

  const brands = cards
    .filter((c) => c.href && c.href !== "#")
    .map((c) => ({ href: c.href, brand: brandOf(c.label) }));

  return (
    <Container className="relative flex items-center justify-between gap-4 py-3">
      <Logo />

      {/* Bari screen (xl) par links seedhe navbar mein */}
      <ul className="hidden items-center gap-8 text-sm font-medium xl:flex">
        <li className="text-brand">
          <Link href="/">Home</Link>
        </li>

        {/* Collection dropdown */}
        <li className="group relative">
          <button type="button" className="flex items-center gap-1 outline-none">
            Collection
            <ChevronDown
              size={16}
              className="transition group-focus-within:rotate-180 group-hover:rotate-180"
            />
          </button>

          <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <div className="w-64 border-t-2 border-brand bg-white p-5 text-neutral-900 shadow-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Ceiling Fan
              </p>

              <div className="mt-4 space-y-4">
                {brands.map((b) => (
                  <div key={b.href}>
                    <p className="text-sm font-bold uppercase tracking-wide text-neutral-900">
                      {b.brand}
                    </p>
                    <Link
                      href={b.href}
                      className="mt-1 block text-sm font-normal text-neutral-600 transition hover:text-gold-dark"
                    >
                      {b.brand} Fans
                    </Link>
                  </div>
                ))}
                {brands.length === 0 && (
                  <p className="text-sm font-normal text-neutral-500">Abhi koi brand nahi hai.</p>
                )}
              </div>
            </div>
          </div>
        </li>

        {otherLinks.map((l) => (
          <li key={l}>
            <a href="#">{l}</a>
          </li>
        ))}
      </ul>

      {/* Tablet/laptop par search seedha navbar mein */}
      <div className="hidden min-w-0 max-w-[450px] flex-1 sm:block">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        <CartButton />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Menu band karo" : "Menu kholo"}
          aria-expanded={open}
          className="xl:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menu panel: mobile par search + links, tablet par sirf links */}
      {open && (
        <div className="absolute inset-x-0 top-full z-40 max-h-[75vh] overflow-y-auto border-b border-neutral-200 bg-white p-4 text-neutral-900 shadow-lg xl:hidden">
          <div className="sm:hidden">
            <SearchBar />
          </div>

          <ul className="mt-2 flex flex-col text-sm font-medium sm:mt-0">
            <li className="border-b border-neutral-100">
              <Link href="/" onClick={() => setOpen(false)} className="block py-3 text-gold-dark">
                Home
              </Link>
            </li>

            {/* Collection (dabane par khulta hai) */}
            <li className="border-b border-neutral-100">
              <button
                type="button"
                onClick={() => setColOpen((o) => !o)}
                aria-expanded={colOpen}
                className="flex w-full items-center justify-between py-3 hover:text-gold-dark"
              >
                Collection
                <ChevronDown size={18} className={`transition ${colOpen ? "rotate-180" : ""}`} />
              </button>

              {colOpen && (
                <div className="pb-3 pl-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Ceiling Fan
                  </p>
                  <div className="mt-3 space-y-3">
                    {brands.map((b) => (
                      <div key={b.href}>
                        <p className="text-sm font-bold uppercase">{b.brand}</p>
                        <Link
                          href={b.href}
                          onClick={() => {
                            setOpen(false);
                            setColOpen(false);
                          }}
                          className="mt-0.5 block text-sm font-normal text-neutral-600 hover:text-gold-dark"
                        >
                          {b.brand} Fans
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {otherLinks.map((l) => (
              <li key={l} className="border-b border-neutral-100 last:border-0">
                <a href="#" onClick={() => setOpen(false)} className="block py-3 hover:text-gold-dark">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
}