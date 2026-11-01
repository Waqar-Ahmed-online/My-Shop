"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import type { FanModel } from "@/types";
import { FAN_TYPES, getFanType } from "@/lib/fanTypes";
import { rs } from "@/lib/format";

type Sort = "default" | "low" | "high";

function SortSelect({
  value,
  onChange,
  className = "",
}: {
  value: Sort;
  onChange: (v: Sort) => void;
  className?: string;
}) {
  return (
    <select
      aria-label="Sort by"
      value={value}
      onChange={(e) => onChange(e.target.value as Sort)}
      className={`border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 ${className}`}
    >
      <option value="default">Sort: Default</option>
      <option value="low">Price: Low to High</option>
      <option value="high">Price: High to Low</option>
    </select>
  );
}

export default function CategoryView({
  label,
  category,
  models,
}: {
  label: string;
  category: string;
  models: FanModel[];
}) {
  const [type, setType] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("default");
  const [open, setOpen] = useState(false); // mobile filter panel

  const tabs = [
    { value: "all", label: "All", count: models.length },
    ...FAN_TYPES.map((t) => ({
      value: t.value as string,
      label: t.label as string,
      count: models.filter((m) => getFanType(m) === t.value).length,    })),
  ];

  const list = useMemo(() => {
         const filtered = type === "all" ? models : models.filter((m) => getFanType(m) === type);
    if (sort === "default") return filtered;
    // price na ho to hamesha aakhir mein
    return [...filtered].sort((a, b) => {
      if (a.price === null && b.price === null) return 0;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return sort === "low" ? a.price - b.price : b.price - a.price;
    });
  }, [models, type, sort]);

  const filterActive = type !== "all" || sort !== "default";

  return (
    <div className="mx-auto max-w-[1400px]">
      {/* Heading row: [links] [SK FAN] [sort] */}
      <div className="relative lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6">
        {/* Desktop: left side links (row wise) */}
                <nav className="hidden lg:flex lg:flex-wrap lg:items-center lg:gap-2">
          {tabs.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
                            className={`rounded-full px-4 py-1.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                type === t.value
                  ? "bg-neutral-900 font-semibold text-white"
                  : "bg-white/85 text-neutral-800 hover:bg-white"
              }`}
            >
              {t.label} <span className="text-xs opacity-60">({t.count})</span>
            </button>
          ))}
        </nav>

                <h1 className="px-12 text-center font-display text-4xl font-semibold uppercase tracking-wide text-white drop-shadow-sm sm:text-5xl lg:px-0">
          {label}
        </h1>

        {/* Desktop: right side sort */}
        <div className="hidden lg:flex lg:justify-end">
          <SortSelect value={sort} onChange={setSort} className="w-52" />
        </div>

        {/* Mobile: filter icon */}
        <button
          type="button"
          aria-label="Filter aur sort"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-neutral-300 bg-white text-neutral-900 lg:hidden"
        >
          <SlidersHorizontal size={18} />
          {filterActive && (
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-brand" />
          )}
        </button>

        {/* Mobile: panel (bahar tap karne par band) */}
        {open && (
          <>
            <button
              type="button"
              aria-label="Band karo"
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-10 cursor-default lg:hidden"
            />
            <div className="absolute left-0 top-full z-20 mt-3 w-64 border border-neutral-200 bg-white py-2 shadow-xl lg:hidden">
              <p className="px-4 pb-1 pt-1 text-xs uppercase tracking-[0.2em] text-neutral-500">
                Filter
              </p>
              {tabs.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setType(t.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${
                    type === t.value
                      ? "bg-brand/15 font-semibold text-neutral-900"
                      : "text-neutral-700"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-xs opacity-60">({t.count})</span>
                </button>
              ))}

              <div className="mt-2 border-t border-neutral-200 px-4 pb-2 pt-3">
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Sort by
                </p>
                <SortSelect
                  value={sort}
                  onChange={(v) => {
                    setSort(v);
                    setOpen(false);
                  }}
                  className="w-full"
                />
              </div>
            </div>
          </>
        )}
      </div>

           {list.length === 0 ? (
        <p className="mt-12 text-center text-sm text-white">
          Is filter mein abhi koi model nahi hai.
        </p>
      ) : (
        <div className="mx-auto mt-8 grid max-w-md grid-cols-1 gap-6 lg:mt-10 lg:max-w-none lg:grid-cols-3 lg:gap-8">
                           {list.map((m, i) => {
            const discount =
              m.oldPrice !== null && m.price !== null && m.oldPrice > m.price
                ? Math.round(((m.oldPrice - m.price) / m.oldPrice) * 100)
                : 0;

            return (
              <Link
                key={m.id}
                href={`/${category}/${m.id}`}
                className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* photo */}
                <div className="relative aspect-square bg-white">
                  {discount > 0 && m.inStock && (
                    <span className="absolute left-3 top-3 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
                      -{discount}%
                    </span>
                  )}
                  {!m.inStock && (
                    <span className="absolute left-3 top-3 z-10 rounded bg-neutral-800 px-2 py-1 text-xs font-semibold text-white">
                      Out of Stock
                    </span>
                  )}
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    quality={90}
                    priority={i < 3}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className={`object-contain p-3 transition duration-500 group-hover:scale-105 ${
                      m.inStock ? "" : "opacity-50"
                    }`}
                  />
                </div>

                {/* tafseel */}
                <div className="flex flex-1 flex-col border-t border-neutral-100 p-4">
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold uppercase leading-5 tracking-wide text-neutral-900">
                    {m.name}
                  </h3>

                  {m.colors.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5">
                      {m.colors.slice(0, 5).map((c) => (
                        <span
                          key={c.id}
                          title={c.name}
                          className="h-4 w-4 rounded-full border border-neutral-300"
                          style={{
                            background: c.hex2
                              ? `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)`
                              : c.hex,
                          }}
                        />
                      ))}
                      {m.colors.length > 5 && (
                        <span className="text-xs text-neutral-500">+{m.colors.length - 5}</span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
                    {m.price !== null && (
                      <span className="text-lg font-bold text-neutral-900">{rs(m.price)}</span>
                    )}
                    {m.oldPrice !== null && (
                      <span className="text-sm text-neutral-400 line-through">
                        {rs(m.oldPrice)}
                      </span>
                    )}
                  </div>

                  <span className="mt-4 block rounded bg-brand py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-black transition group-hover:bg-neutral-900 group-hover:text-white">
                    View Details
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}