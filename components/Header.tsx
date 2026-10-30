"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Container from "./Container";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartButton from "./CartButton";

const links = ["Home", "Shop", "Deals", "About Us", "Contact"];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <Container className="relative flex items-center justify-between gap-4 py-3">
      <Logo />

      {/* Bari screen (xl) par links seedhe navbar mein */}
      <ul className="hidden items-center gap-8 text-sm font-medium xl:flex">
        {links.map((l, i) => (
          <li key={l} className={i === 0 ? "text-brand" : ""}>
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
        <div className="absolute inset-x-0 top-full z-40 border-b border-neutral-200 bg-white p-4 text-neutral-900 shadow-lg xl:hidden">
          <div className="sm:hidden">
            <SearchBar />
          </div>
          <ul className="mt-2 flex flex-col text-sm font-medium sm:mt-0">
            {links.map((l, i) => (
              <li key={l} className="border-b border-neutral-100 last:border-0">
                <a
                  href="#"
                  onClick={() => setOpen(false)}
                  className={`block py-3 ${i === 0 ? "text-gold-dark" : "hover:text-gold-dark"}`}
                >
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