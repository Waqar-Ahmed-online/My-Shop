"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { rs } from "@/lib/format";

export default function CartView() {
  const { items, total, setQty, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold uppercase text-neutral-900">Cart</h1>
        <p className="mt-6 text-sm text-neutral-500">Aap ka cart khali hai.</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] hover:bg-[#D9A441]"
        >
          Shopping shuru karo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 font-display text-4xl font-semibold uppercase text-neutral-900">
        Cart
      </h1>

      <div className="space-y-4">
        {items.map((it) => (
          <div
            key={it.key}
            className="flex flex-wrap items-center gap-4 border border-neutral-200 bg-white p-3 shadow-sm"
          >
            <Link
              href={it.href}
              className="relative h-24 w-24 shrink-0 border border-neutral-200 bg-white"
            >
              <Image
                src={it.image}
                alt={it.name}
                fill
                sizes="96px"
                className="object-contain p-2"
              />
            </Link>

            <div className="min-w-40 flex-1">
              <Link href={it.href} className="font-semibold text-neutral-900 hover:text-gold-dark">
                {it.name}
              </Link>
              <p className="mt-1 text-xs text-neutral-500">
                {[it.color, it.size && `Size ${it.size}`].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-1 text-sm text-gold-dark">{rs(it.price)}</p>
            </div>

            <div className="flex items-center border border-neutral-300">
              <button
                type="button"
                onClick={() => setQty(it.key, it.qty - 1)}
                className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-black"
                aria-label="Kam karo"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm text-neutral-900">{it.qty}</span>
              <button
                type="button"
                onClick={() => setQty(it.key, it.qty + 1)}
                className="flex h-9 w-9 items-center justify-center text-neutral-600 hover:text-black"
                aria-label="Barhao"
              >
                <Plus size={14} />
              </button>
            </div>

            <p className="w-28 text-right text-sm font-semibold text-neutral-900">
              {rs(it.price * it.qty)}
            </p>

            <button
              type="button"
              onClick={() => remove(it.key)}
              className="text-neutral-400 hover:text-red-600"
              aria-label="Hatao"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-dashed border-neutral-300 pt-6">
        <p className="text-sm uppercase tracking-widest text-neutral-500">Total</p>
        <p className="text-2xl font-semibold text-gold-dark">{rs(total)}</p>
      </div>
    </div>
  );
}