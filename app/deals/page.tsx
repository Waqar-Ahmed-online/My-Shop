import Link from "next/link";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { getDeals } from "@/lib/search";

export const metadata = { title: "Deals | Abrar Store" };

export default async function DealsPage() {
  const deals = await getDeals();

  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header active="deals" />
      </header>

      <main className="min-h-screen bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-neutral-500">
              Limited Offers
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold uppercase tracking-wide text-neutral-900 sm:text-5xl">
              Hot Deals
            </h1>
            <div className="mx-auto mt-4 h-0.5 w-16 bg-brand" />
            {deals.length > 0 && (
              <p className="mt-4 text-sm text-neutral-500">
                Discount on {deals.length} {deals.length === 1 ? "product" : "products"}
              </p>
            )}
          </div>

          {deals.length === 0 ? (
            <div className="mt-12 text-center text-sm text-neutral-600">
              <p>No deals right now. Please check back soon!</p>
              <Link
                href="/collection"
                className="mt-4 inline-block bg-brand px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-black"
              >
                Browse Collection
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {deals.map((m, i) => (
                <ProductCard key={m.id} m={m} priority={i < 4} showSaving />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}