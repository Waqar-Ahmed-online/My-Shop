"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { rs } from "@/lib/format";

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923001234567";

type Done = {
  orderNo: string;
  total: number;
  items: { name: string; color: string; size: string; qty: number; price: number }[];
};

const empty = { name: "", phone: "", email: "", city: "", address: "", note: "", website: "" };

const field =
  "w-full border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900";
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.15em] text-neutral-600";

export default function CheckoutView() {
  const { items, total, ready, clear } = useCart();
  const [v, setV] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Done | null>(null);

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setV((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const digits = v.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      setError("Please enter a valid phone number (e.g. 0300 1234567)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          items: items.map((i) => ({
            modelId: i.modelId,
            color: i.color ?? "",
            size: i.size ?? "",
            qty: i.qty,
          })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not place the order, please try again");
        return;
      }

      setDone(data as Done);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("There seems to be an internet problem, please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) return null;

  /* ---------- order placed ---------- */
  if (done) {
    const lines = done.items
      .map(
        (i, n) =>
          `${n + 1}. ${i.name}${i.color ? ` (${i.color})` : ""}${i.size ? ` Size ${i.size}` : ""} x${i.qty} = ${rs(i.price * i.qty)}`
      )
      .join("\n");

    const text =
      `Assalam o Alaikum! My order:\n` +
      `Order No: ${done.orderNo}\n${lines}\n` +
      `Total: ${rs(done.total)}\n\n` +
      `Name: ${v.name}\nPhone: ${v.phone}\nCity: ${v.city}\nAddress: ${v.address}`;

    return (
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 size={34} />
        </span>
        <h1 className="mt-5 font-display text-3xl font-semibold uppercase text-neutral-900 sm:text-4xl">
          Order Received
        </h1>
        <p className="mt-3 text-sm text-neutral-600">
          Thank you, {v.name}! We have received your order. We will contact you shortly to
          confirm it.
        </p>
        {v.email && (
          <p className="mt-2 text-sm text-neutral-600">
            A confirmation email is being sent to <span className="font-semibold">{v.email}</span>{" "}
            (please check your spam folder too).
          </p>
        )}
        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Order Number</p>
          <p className="mt-1 font-display text-3xl font-semibold text-neutral-900">
            {done.orderNo}
          </p>
          <p className="mt-3 text-sm text-neutral-600">
            Total: <span className="font-semibold text-gold-dark">{rs(done.total)}</span>
          </p>
        </div>

        <p className="mt-6 text-sm text-neutral-600">
          To get your order confirmed faster, send it to us on WhatsApp too:
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition hover:opacity-90"
          >
            <MessageCircle size={16} /> Send on WhatsApp
          </a>
          <Link
            href="/collection"
            className="border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- cart empty ---------- */
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold uppercase text-neutral-900">
          Checkout
        </h1>
        <p className="mt-6 text-sm text-neutral-500">Your cart is empty.</p>
        <Link
          href="/collection"
          className="mt-6 inline-block bg-brand px-8 py-3 text-xs font-semibold uppercase tracking-wider text-black"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  /* ---------- form + order summary ---------- */
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-8 font-display text-4xl font-semibold uppercase text-neutral-900">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:gap-12">
        {/* form */}
        <form onSubmit={onSubmit} className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900">
            Delivery Details
          </h2>

          <div>
            <label htmlFor="name" className={label}>Full Name</label>
            <input
              id="name"
              name="name"
              value={v.name}
              onChange={change}
              required
              minLength={2}
              autoComplete="name"
              placeholder="Your name"
              className={field}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="phone" className={label}>Phone / WhatsApp</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                value={v.phone}
                onChange={change}
                required
                autoComplete="tel"
                placeholder="0300 1234567"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="city" className={label}>City</label>
              <input
                id="city"
                name="city"
                value={v.city}
                onChange={change}
                required
                autoComplete="address-level2"
                placeholder="Your city"
                className={field}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className={label}>
              Email{" "}
              <span className="font-normal normal-case text-neutral-400">
                (optional, for confirmation)
              </span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              value={v.email}
              onChange={change}
              autoComplete="email"
              placeholder="you@gmail.com"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="address" className={label}>Complete Address</label>
            <textarea
              id="address"
              name="address"
              value={v.address}
              onChange={change}
              required
              minLength={8}
              rows={3}
              autoComplete="street-address"
              placeholder="House / shop number, street, area"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="note" className={label}>
              Order Note <span className="font-normal normal-case text-neutral-400">(optional)</span>
            </label>
            <textarea
              id="note"
              name="note"
              value={v.note}
              onChange={change}
              rows={2}
              placeholder="Write here if there is anything special"
              className={field}
            />
          </div>

          {/* hidden field: only bots fill this in */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                name="website"
                value={v.website}
                onChange={change}
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          {error && (
            <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            disabled={loading}
            className="w-full bg-brand py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-neutral-900 hover:text-white disabled:opacity-60"
          >
            {loading ? "Placing order..." : `Place Order · ${rs(total)}`}
          </button>

          <p className="text-xs leading-relaxed text-neutral-500">
            After you place the order, we will contact you to confirm it and let you know about
            delivery and payment.
          </p>
        </form>

        {/* order summary */}
        <aside className="order-first self-start rounded-lg border border-neutral-200 bg-neutral-50 p-5 lg:order-none lg:sticky lg:top-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900">
              Order Summary
            </h2>
            <Link
              href="/cart"
              className="text-xs uppercase tracking-wider text-neutral-500 underline hover:text-gold-dark"
            >
              Edit cart
            </Link>
          </div>

          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.key} className="flex items-center gap-3">
                {/* image fills the whole box */}
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded border border-neutral-200 bg-white">
                  <Image
                    src={it.image}
                    alt={it.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                  <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-bl bg-neutral-900 px-1 text-[10px] font-bold text-white">
                    {it.qty}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900">{it.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {[it.color, it.size && `Size ${it.size}`].filter(Boolean).join(" · ") ||
                      `${rs(it.price)} each`}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold text-neutral-900">
                  {rs(it.price * it.qty)}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-2 border-t border-dashed border-neutral-300 pt-4 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal</span>
              <span>{rs(total)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>Delivery</span>
              <span>We will confirm</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-200 pt-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900">
                Total
              </span>
              <span className="text-xl font-bold text-gold-dark">{rs(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}