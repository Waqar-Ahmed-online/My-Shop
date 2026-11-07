"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Container from "./Container";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CartButton from "./CartButton";

type Active = "home" | "collection" | "deals" | "about" | "help";

const links: { label: string; href: string; key?: Active }[] = [
  { label: "Home", href: "/", key: "home" },
  { label: "Collection", href: "/collection", key: "collection" },
  { label: "Deals", href: "/deals", key: "deals" },
  { label: "About Us", href: "/about", key: "about" },
  { label: "Help", href: "/help", key: "help" },
];

export default function Header({ active = "home" }: { active?: Active }) {
  const [open, setOpen] = useState(false);

  return (
    <Container className="relative flex items-center justify-between gap-4 py-3">
      <Link href="/" aria-label="Abrar Store - Home" className="shrink-0">
        <Logo />
      </Link>

      {/* Large screen (xl): links directly in the navbar */}
      <ul className="hidden items-center gap-8 text-sm font-medium xl:flex">
        {links.map((l) => (
          <li key={l.label} className={l.key === active ? "text-brand" : ""}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>

      {/* Tablet/laptop: search directly in the navbar */}
      <div className="hidden min-w-0 max-w-[450px] flex-1 sm:block">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        <CartButton />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="xl:hidden"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menu panel: search + links on mobile, only links on tablet */}
      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b border-neutral-200 bg-white p-4 text-neutral-900 shadow-lg xl:hidden">
          <div className="sm:hidden">
            <SearchBar />
          </div>
          <ul className="mt-2 flex flex-col text-sm font-medium sm:mt-0">
            {links.map((l) => (
              <li key={l.label} className="border-b border-neutral-100 last:border-0">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block py-3 ${l.key === active ? "text-gold-dark" : "hover:text-gold-dark"}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Container>
  );
}