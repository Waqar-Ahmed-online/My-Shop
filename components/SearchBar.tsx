"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { rs } from "@/lib/format";

type Hit = {
  id: string;
  name: string;
  image: string;
  price: number | null;
  category: string;
  categoryLabel: string;
};

export default function SearchBar() {
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState(""); // the term whose results have arrived
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const term = q.trim();

  // search 0.25 sec after typing stops
  useEffect(() => {
    if (!term) return;

    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results?: Hit[]; total?: number };
        setHits(data.results ?? []);
        setTotal(data.total ?? 0);
        setActive(-1);
        setDone(term);
      } catch {
        /* a new term was typed, the old request was cancelled */
      }
    }, 250);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [term]);

  // close when clicking outside
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function goResults() {
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const h = hits[active];
    if (h && done === term) {
      setOpen(false);
      router.push(`/${h.category}/${h.id}`);
      return;
    }
    goResults();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown" && hits.length) {
      e.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % hits.length);
    } else if (e.key === "ArrowUp" && hits.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? hits.length - 1 : i - 1));
    }
  }

  const ready = done === term; // results for the current term have arrived

  return (
    <div ref={wrap} className="relative w-full max-w-[450px]">
      <form
        onSubmit={onSubmit}
        className="flex h-11 w-full items-center overflow-hidden rounded-full border border-neutral-300 bg-white"
      >
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search for products, brands and more..."
          aria-label="Search"
          autoComplete="off"
          className="h-full flex-1 px-4 text-sm text-black outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="m-1 flex h-9 w-12 items-center justify-center rounded-full bg-brand text-black"
        >
          <Search size={18} />
        </button>
      </form>

      {open && term && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-2xl">
          {!ready ? (
            <p className="px-4 py-4 text-sm text-neutral-500">Searching...</p>
          ) : hits.length === 0 ? (
            <p className="px-4 py-4 text-sm text-neutral-500">
              No products found for &quot;{term}&quot;.
            </p>
          ) : (
            <>
              <ul className="max-h-[60vh] overflow-y-auto py-1">
                {hits.map((h, i) => (
                  <li key={h.id}>
                    <Link
                      href={`/${h.category}/${h.id}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-3 px-3 py-2 ${
                        active === i ? "bg-neutral-100" : ""
                      }`}
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-white ring-1 ring-black/10">
                        <Image
                          src={h.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-contain p-0.5"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{h.name}</span>
                        <span className="block truncate text-xs text-neutral-500">
                          {h.categoryLabel}
                        </span>
                      </span>
                      {h.price !== null && (
                        <span className="shrink-0 text-sm font-semibold text-gold-dark">
                          {rs(h.price)}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>

              {total > hits.length && (
                <button
                  type="button"
                  onClick={goResults}
                  className="block w-full border-t border-neutral-200 px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-neutral-700 hover:bg-neutral-50"
                >
                  View all {total} results
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}