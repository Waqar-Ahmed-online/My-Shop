"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  Printer,
  Search,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";
import { rs } from "@/lib/format";

/* ============ edit your settings here ============ */
const SHOW_DEALERS = true; // set to false to hide the "Dealers" tab
/* =============================================== */

export type PriceRow = {
  id: string;
  name: string;
  image: string;
  price: number | null;
  oldPrice: number | null;
  category: string;
  label: string;
  inStock: boolean;
};

type TabKey = "price" | "order" | "warranty" | "dealers";

const ALL_TABS: { key: TabKey; label: string; icon: typeof Tag }[] = [
  { key: "price", label: "Price List", icon: Tag },
  { key: "order", label: "How to Order", icon: ShoppingCart },
  { key: "warranty", label: "Warranty", icon: ShieldCheck },
  { key: "dealers", label: "Dealers", icon: Users },
];

const waLink = (number: string, text: string) =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

function PhotoFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto w-full max-w-xs">
      <div aria-hidden className="absolute bottom-0 left-3 right-0 top-3 border-2 border-brand" />
      <div className="relative mb-3 mr-3 aspect-4/5 overflow-hidden bg-neutral-100 shadow-xl">
        <Image
          src={src}
          alt={alt}
          fill
          quality={90}
          sizes="(min-width: 1024px) 28vw, 70vw"
          className="object-cover"
          style={{ objectPosition: "75% 35%" }}
        />
      </div>
    </div>
  );
}

function Title({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold uppercase tracking-wide text-neutral-900 sm:text-4xl">
        {title}
      </h2>
      <div className="mt-4 h-0.5 w-16 bg-brand" />
      {text && <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600">{text}</p>}
    </div>
  );
}

/* ---------------- 1) Price List ---------------- */

function PriceList({ rows, waNumber }: { rows: PriceRow[]; waNumber: string }) {
  const [q, setQ] = useState("");
  const [sec, setSec] = useState("all");

  const labels = useMemo(() => Array.from(new Set(rows.map((r) => r.label))), [rows]);

  const groups = useMemo(() => {
    const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = rows.filter(
      (r) =>
        (sec === "all" || r.label === sec) &&
        words.every((w) => `${r.name} ${r.label}`.toLowerCase().includes(w))
    );
    return labels
      .map((l) => ({ label: l, items: filtered.filter((r) => r.label === l) }))
      .filter((g) => g.items.length > 0);
  }, [rows, labels, q, sec]);

  const count = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Title
          eyebrow="Rate list"
          title="Price List"
          text="Our current prices in one place. Tap any product to see its details."
        />
        <div className="flex gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 border border-neutral-900 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            <Printer size={16} /> Print / PDF
          </button>
          <a
            href={waLink(waNumber, "Assalam o Alaikum! I need the price list.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-brand px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-neutral-900 hover:text-white"
          >
            <MessageCircle size={16} /> Ask on WhatsApp
          </a>
        </div>
      </div>

      {/* search and section filter */}
      <div className="mt-8 space-y-3 print:hidden">
        <div className="flex h-11 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4">
          <Search size={18} className="shrink-0 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search in price list (e.g. 2500W, sk supreme)"
            aria-label="Search in price list"
            className="h-full flex-1 text-sm text-black outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", ...labels].map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setSec(l)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                sec === l
                  ? "bg-neutral-900 font-semibold text-white"
                  : "bg-white text-neutral-800 ring-1 ring-neutral-300 hover:ring-neutral-900"
              }`}
            >
              {l === "all" ? "All" : l}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        {count} {count === 1 ? "product" : "products"}
      </p>

      {groups.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-600">
          No products found. Try a different word.
        </p>
      ) : (
        <div className="mt-4 space-y-8">
          {groups.map((g) => (
            <div key={g.label} className="overflow-hidden rounded-lg ring-1 ring-neutral-200">
              <div className="flex items-center justify-between bg-neutral-900 px-4 py-2.5 text-white">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em]">{g.label}</h3>
                <span className="text-xs text-white/60">{g.items.length}</span>
              </div>

              <ul className="divide-y divide-neutral-100 bg-white">
                {g.items.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/${r.category}/${r.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-neutral-50 sm:gap-4 sm:px-4"
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-white ring-1 ring-black/10">
                        <Image
                          src={r.image}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>

                      <span className="min-w-0 flex-1 text-sm font-medium uppercase tracking-wide text-neutral-900">
                        {r.name}
                      </span>

                      <span className="shrink-0 text-right">
                        {r.price !== null ? (
                          <span className="block text-sm font-bold text-neutral-900">
                            {rs(r.price)}
                          </span>
                        ) : (
                          <span className="block text-xs text-neutral-500">Ask price</span>
                        )}
                        {r.oldPrice !== null && r.price !== null && r.oldPrice > r.price && (
                          <span className="block text-xs text-neutral-400 line-through">
                            {rs(r.oldPrice)}
                          </span>
                        )}
                        {!r.inStock && (
                          <span className="block text-[10px] font-semibold uppercase text-red-600">
                            Out of stock
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-neutral-400">
        Prices can change. Please confirm with us before you order.
      </p>
    </div>
  );
}

/* ---------------- 2) How to Order ---------------- */

const steps = [
  {
    n: 1,
    title: "Choose your product",
    text: "Browse the Collection or use the search bar to find the model you want.",
  },
  {
    n: 2,
    title: "Add it to your cart",
    text: "Pick the colour and quantity, then press Add to Cart.",
  },
  {
    n: 3,
    title: "Confirm on WhatsApp",
    text: "Send us your order details and delivery address. We will confirm availability, price and delivery with you.",
  },
];

function OrderPanel({ image, waNumber }: { image: string; waNumber: string }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_320px]">
      <div>
        <Title
          eyebrow="Easy steps"
          title="How to Order"
          text="Ordering is simple. Follow these three steps."
        />

        <ol className="mt-8 space-y-5">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand font-display text-lg font-bold text-black">
                {s.n}
              </span>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Delivery
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Tell us your city and we will confirm the delivery options and charges.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Payment
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              We will confirm the payment method with you when you place the order.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/collection"
            className="bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-neutral-900 hover:text-white"
          >
            Start Shopping
          </Link>
          <a
            href={waLink(waNumber, "Assalam o Alaikum! I would like to place an order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
          >
            Order on WhatsApp
          </a>
        </div>
      </div>

      <PhotoFrame src={image} alt="Our products" />
    </div>
  );
}

/* ---------------- 3) Warranty ---------------- */

const warrantyCards = [
  {
    title: "Keep your receipt",
    text: "Your purchase receipt is the proof of purchase, so please keep it safe.",
  },
  {
    title: "Ask before you buy",
    text: "Warranty can differ by brand and product. Ask us about the model you are buying and we will tell you what applies.",
  },
  {
    title: "Having a problem?",
    text: "Message us the product name and a short description (a photo or video helps). We will guide you on the next step.",
  },
];

function WarrantyPanel({ waNumber }: { waNumber: string }) {
  return (
    <div>
      <Title
        eyebrow="After sales"
        title="Warranty & Support"
        text="We want you to buy with confidence and get help quickly if anything goes wrong."
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-6">
        {warrantyCards.map((c, i) => (
          <div
            key={c.title}
            className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-gold-dark">
              {i === 0 ? <Tag size={22} /> : i === 1 ? <ShieldCheck size={22} /> : <MessageCircle size={22} />}
            </span>
            <h3 className="mt-4 text-sm font-semibold uppercase tracking-wider text-neutral-900">
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{c.text}</p>
          </div>
        ))}
      </div>

      <a
        href={waLink(waNumber, "Assalam o Alaikum! I need information about the warranty.")}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-block bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-neutral-900 hover:text-white"
      >
        Ask about warranty
      </a>
    </div>
  );
}

/* ---------------- 4) Dealers ---------------- */

function DealersPanel({ image, waNumber }: { image: string; waNumber: string }) {
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_320px]">
      <div>
        <Title
          eyebrow="For shopkeepers"
          title="Dealers & Bulk Orders"
          text="Are you a shopkeeper, or buying in bulk? Send us the products and quantity you need and we will share our rates with you."
        />

        <ul className="mt-8 space-y-3 text-sm text-neutral-700">
          {[
            "Tell us which products you need",
            "Tell us how many pieces you want",
            "We reply with our rates on WhatsApp",
          ].map((t) => (
            <li key={t} className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
              {t}
            </li>
          ))}
        </ul>

        <a
          href={waLink(waNumber, "Assalam o Alaikum! I need bulk / dealer rates.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 bg-brand px-6 py-3 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-neutral-900 hover:text-white"
        >
          <MessageCircle size={16} /> Ask for dealer rates
        </a>
      </div>

      <PhotoFrame src={image} alt="Dealer rates" />
    </div>
  );
}

/* ---------------- tabs ---------------- */

export default function HelpTabs({
  rows,
  images,
  waNumber,
}: {
  rows: PriceRow[];
  images: string[];
  waNumber: string;
}) {
  const tabs = ALL_TABS.filter((t) => t.key !== "dealers" || SHOW_DEALERS);
  const [tab, setTab] = useState<TabKey>("price");

  const img1 = images[0] ?? "/images/fan-bg.jpg";
  const img2 = images[1] ?? images[0] ?? "/images/fan-bg.jpg";

  return (
    <section className="bg-white px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div
          role="tablist"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 print:hidden"
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-neutral-900 text-white shadow"
                  : "bg-white text-neutral-800 ring-1 ring-neutral-300 hover:ring-neutral-900"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {tab === "price" && <PriceList rows={rows} waNumber={waNumber} />}
          {tab === "order" && <OrderPanel image={img1} waNumber={waNumber} />}
          {tab === "warranty" && <WarrantyPanel waNumber={waNumber} />}
          {tab === "dealers" && SHOW_DEALERS && <DealersPanel image={img2} waNumber={waNumber} />}
        </div>
      </div>
    </section>
  );
}