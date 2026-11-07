import { Suspense } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import LoaderScreen from "@/components/LoaderScreen";
import ProductCard from "@/components/ProductCard";
import { searchModels } from "@/lib/search";

export const metadata = { title: "Search | Abrar Store" };

async function Results({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const q = (raw ?? "").trim().slice(0, 60);
  const hits = q ? await searchModels(q, 200) : [];

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-semibold uppercase tracking-wide text-neutral-900 sm:text-4xl">
        {q ? "Search results" : "Search"}
      </h1>
      {q && (
        <p className="mt-2 text-sm text-neutral-500">
          Found {hits.length} {hits.length === 1 ? "product" : "products"} for &quot;{q}&quot;
        </p>
      )}

      {!q ? (
        <p className="mt-10 text-sm text-neutral-500">
          Type a product name in the search bar above (e.g. &quot;sk supreme&quot; or
          &quot;2500W&quot;).
        </p>
      ) : hits.length === 0 ? (
        <div className="mt-10 text-sm text-neutral-600">
          <p>No products found. Try a different word, or browse the collection.</p>
          <Link
            href="/collection"
            className="mt-4 inline-block bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black"
          >
            Browse Collection
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
          {hits.map((m, i) => (
            <ProductCard key={m.id} m={m} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header />
      </header>
      <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
        <Suspense fallback={<LoaderScreen />}>
          <Results searchParams={props.searchParams} />
        </Suspense>
      </main>
    </>
  );
}