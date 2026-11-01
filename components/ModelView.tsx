"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Heart, Link2, Minus, Plus } from "lucide-react";
import type { FanModel } from "@/types";
import { rs } from "@/lib/format";
import { useCart } from "@/lib/cart";

type Props = { model: FanModel; category: { label: string; href: string } };

const dashed = "border-t border-dashed border-neutral-300";

export default function ModelView({ model, category }: Props) {
  const { add, wishlist, toggleWish } = useCart();
  const [i, setI] = useState(0);
  const [size, setSize] = useState(model.sizes[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);

  const color = model.colors[i];
  const image = color?.image ?? model.image;
  const liked = wishlist.includes(model.id);
  const canBuy = model.inStock && model.price !== null;

  function addToCart() {
    if (!canBuy) return;
    add({
      modelId: model.id,
      name: model.name,
      image,
      price: model.price as number,
      color: color?.name,
      size: size || undefined,
      qty,
      href: `/${model.category}/${model.id}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function share(kind: "facebook" | "whatsapp") {
    const url = window.location.href;
    const link =
      kind === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        : `https://wa.me/?text=${encodeURIComponent(`${model.name} ${url}`)}`;
    window.open(link, "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { }
  }

  const shareBtn =
    "border border-neutral-300 px-3 py-1.5 text-xs uppercase tracking-wider text-neutral-600 transition hover:border-gold-dark hover:text-gold-dark";

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="relative aspect-square border border-neutral-200 bg-white">
        <Image
          key={image}
          src={image}
          alt={color ? `${model.name} - ${color.name}` : model.name}
          fill
          priority
          quality={90}
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain p-6"
        />
      </div>

      <div>
        <h1 className="font-display text-4xl font-semibold uppercase tracking-wide text-neutral-900 sm:text-5xl">
          {model.name}
        </h1>

        <p className="mt-4 flex items-center gap-3 text-xl">
          {model.oldPrice !== null && (
            <span className="text-neutral-400 line-through">{rs(model.oldPrice)}</span>
          )}
          {model.price !== null && (
            <span className="font-semibold text-gold-dark">{rs(model.price)}</span>
          )}
        </p>

        {(model.colors.length > 0 || model.sizes.length > 0) && (
          <div className={`mt-6 space-y-5 pt-6 ${dashed}`}>
            {model.colors.length > 0 && (
              <div className="flex items-center gap-5">
                <p className="w-12 text-sm font-semibold text-neutral-900">Color</p>
                <div className="flex flex-wrap gap-2">
                  {model.colors.map((c, idx) => {
                    const active = idx === i;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setI(idx)}
                        title={c.name}
                        aria-label={c.name}
                        aria-pressed={active}
                        className={`h-10 w-10 border-2 p-[3px] transition ${active
                            ? "border-neutral-900"
                            : "border-neutral-300 hover:border-neutral-500"
                          }`}
                      >
                        <span
                          className="flex h-full w-full items-center justify-center"
                          style={
                            c.hex2
                              ? { background: `linear-gradient(135deg, ${c.hex} 50%, ${c.hex2} 50%)` }
                              : { backgroundColor: c.hex }
                          }
                        >
                          {active && (
                            <Check
                              size={18}
                              strokeWidth={3}
                              className="text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.8)]"
                            />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  {color.name}
                </p>
              </div>
            )}

            {model.sizes.length > 0 && (
              <div className="flex items-center gap-5">
                <p className="w-12 text-sm font-semibold text-neutral-900">Size</p>
                <div className="flex flex-wrap gap-2">
                  {model.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      aria-pressed={s === size}
                      className={`h-10 min-w-10 border-2 px-3 text-sm transition ${s === size
                          ? "border-neutral-900 text-neutral-900"
                          : "border-neutral-300 text-neutral-600 hover:border-neutral-500"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={`mt-6 pt-6 ${dashed}`}>
          <p
            className={`text-sm font-semibold ${model.inStock ? "text-green-600" : "text-red-600"
              }`}
          >
            {model.inStock ? "In stock" : "Out of stock"}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-neutral-300">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-11 w-10 items-center justify-center text-neutral-600 hover:text-black"
                aria-label="Quantity kam karo"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center text-sm text-neutral-900">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="flex h-11 w-10 items-center justify-center text-neutral-600 hover:text-black"
                aria-label="Quantity barhao"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={addToCart}
              disabled={!canBuy}
              className="h-11 bg-gold px-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#111111] transition hover:bg-[#D9A441] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => toggleWish(model.id)}
            className="mt-5 flex items-center gap-2 text-sm text-neutral-600 transition hover:text-gold-dark"
          >
            <Heart
              size={20}
              className={liked ? "fill-gold-dark text-gold-dark" : ""}
            />
            {liked ? "Wishlist me hai" : "Add to wishlist"}
          </button>
        </div>

        <div className={`mt-6 space-y-4 pt-5 text-sm ${dashed}`}>
          <p className="text-neutral-500">
            Category:{" "}
            <Link href={category.href} className="text-gold-dark hover:underline">
              {category.label}
            </Link>
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-neutral-500">Share:</span>
            <button type="button" onClick={() => share("facebook")} className={shareBtn}>
              Facebook
            </button>
            <button type="button" onClick={() => share("whatsapp")} className={shareBtn}>
              WhatsApp
            </button>
            <button
              type="button"
              onClick={copyLink}
              className={`${shareBtn} flex items-center gap-1.5`}
            >
              <Link2 size={14} />
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}