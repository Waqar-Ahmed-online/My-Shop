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
    <div className="mx-auto max-w-6xl">
      <h1 className="text-center font-display text-4xl font-semibold uppercase tracking-wide text-neutral-900 sm:text-5xl">
        {card.label}
      </h1>

      {models.length === 0 ? (
        <p className="mt-12 text-center text-sm text-neutral-500">
          Is category me abhi koi model nahi hai.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {models.map((m) => (
  <Link
    key={m.id}
    href={`/${category}/${m.id}`}
    className="group block border border-neutral-200 bg-white transition hover:border-gold hover:shadow-md"
  >
    <div className="relative aspect-square border-b border-neutral-200 bg-white">
      <Image
        src={m.image}
        alt={m.name}
        fill
        quality={90}
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        className="object-contain p-4"
      />
    </div>
    <div className="p-3">
      <p className="text-sm font-semibold text-neutral-900">{m.name}</p>
      <p className="mt-1 flex items-center gap-2 text-sm">
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