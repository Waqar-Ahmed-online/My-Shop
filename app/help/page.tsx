import Header from "@/components/Header";
import ParallaxBg from "@/components/ParallaxBg";
import HelpTabs, { type PriceRow } from "@/components/HelpTabs";
import { getFanCards, getFanModels } from "@/lib/data";

export const metadata = { title: "Help Center | Abrar Store" };

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923493032515";

export default async function HelpPage() {
  const [cards, models] = await Promise.all([getFanCards(), getFanModels()]);

  // only products that have a card (otherwise their page won't open)
  const sections = cards
    .filter((c) => c.href && c.href !== "#")
    .map((c) => ({ slug: c.href.replace(/^\//, ""), label: c.label }));
  const labelBySlug = new Map(sections.map((s) => [s.slug, s.label]));
  const orderOf = new Map(sections.map((s, i) => [s.slug, i]));

  const rows: PriceRow[] = models
    .filter((m) => labelBySlug.has(m.category))
    .map((m) => ({
      id: m.id,
      name: m.name,
      image: m.image,
      price: m.price,
      oldPrice: m.oldPrice,
      category: m.category,
      label: labelBySlug.get(m.category) as string,
      inStock: m.inStock,
    }))
    .sort(
      (a, b) =>
        (orderOf.get(a.category) ?? 0) - (orderOf.get(b.category) ?? 0) ||
        a.name.localeCompare(b.name, undefined, { numeric: true })
    );

  const waLink = `https://wa.me/${WA}?text=${encodeURIComponent(
    "Assalam o Alaikum! I need your help."
  )}`;

  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900 print:hidden">
        <Header active="help" />
      </header>

      <main>
        {/* banner */}
        <section className="relative isolate px-4 py-16 text-center sm:px-6 sm:py-24 print:hidden">
          <ParallaxBg src="/images/fan-bg.jpg" overlay="bg-black/50" />
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/80">
            We are here to help
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold uppercase tracking-wide text-white drop-shadow-sm sm:text-6xl">
            Help Center
          </h1>
          <div className="mx-auto mt-5 h-0.5 w-16 bg-brand" />
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            Prices, how to order and warranty, all in one place.
          </p>
        </section>

        <HelpTabs
          rows={rows}
          images={cards.slice(0, 2).map((c) => c.image)}
          waNumber={WA}
        />

        {/* final call-to-action strip */}
        <section className="bg-neutral-900 px-4 py-12 text-center sm:px-6 print:hidden">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-white sm:text-3xl">
            Still have a question?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70">
            Message us on WhatsApp and we will get back to you.
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block bg-brand px-8 py-3 text-xs font-semibold uppercase tracking-wider text-black transition hover:bg-white"
          >
            Chat on WhatsApp
          </a>
        </section>
      </main>
    </>
  );
}