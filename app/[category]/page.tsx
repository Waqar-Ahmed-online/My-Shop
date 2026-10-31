import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { getFanCards, getFanModels } from "@/lib/data";
import Link from "next/link";
import { rs } from "@/lib/format";

export async function generateStaticParams() {
  const cards = await getFanCards();
  const slugs = cards
    .map((c) => c.href.replace(/^\//, ""))
    .filter((s) => s && s !== "#");

  // build ke liye kam az kam 1 param chahiye
  return (slugs.length ? slugs : ["sk-fan-categories"]).map((category) => ({ category }));
}

async function Content({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  const cards = await getFanCards();
  const card = cards.find((c) => c.href === `/${category}`);
  if (!card) notFound();

  const models = await getFanModels(category);

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="text-center font-display text-4xl font-semibold uppercase tracking-wide text-neutral-900 sm:text-5xl">
        {card.label}
      </h1>

      {models.length === 0 ? (
        <p className="mt-12 text-center text-sm text-neutral-500">
          Is category me abhi koi model nahi hai.
        </p>
      ) : (
        <div className="mx-auto mt-10 grid max-w-md grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3 lg:gap-8">
          {models.map((m) => (
            <Link
              key={m.id}
              href={`/${category}/${m.id}`}
              className="group block overflow-hidden border border-neutral-200 bg-white shadow-sm transition hover:border-gold hover:shadow-lg"
            >
              {/* Image: home ke fan cards jitna size (3:4) */}
              <div className="relative aspect-4/5 overflow-hidden border-b border-neutral-200 bg-white">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  quality={90}
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-contain p-4 transition duration-700 group-hover:scale-105"
                />
              </div>

              <div className="p-4 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-neutral-900">
                  {m.name}
                </p>
                <p className="mt-1 flex items-center justify-center gap-2 text-sm">
                  {m.oldPrice !== null && (
                    <span className="text-neutral-500 line-through">{rs(m.oldPrice)}</span>
                  )}
                  {m.price !== null && (
                    <span className="font-semibold text-gold-dark">{rs(m.price)}</span>
                  )}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryPage(props: PageProps<"/[category]">) {
  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header />
      </header>
      <main className="min-h-screen bg-white px-4 py-14 sm:px-6">
        <Suspense fallback={<p className="text-center text-neutral-500">Loading...</p>}>
          <Content params={props.params} />
        </Suspense>
      </main>
    </>
  );
}