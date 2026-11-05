import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import ParallaxBg from "@/components/ParallaxBg";
import { getFanCards, getFanModels } from "@/lib/data";

export const metadata = { title: "All Collections | Abrar Store" };

export default async function CollectionPage() {
  const cards = await getFanCards();

  // har card ke kitne models hain
  const items = await Promise.all(
    cards.map(async (c) => {
      const slug = c.href.replace(/^\//, "");
      const count = slug && slug !== "#" ? (await getFanModels(slug)).length : 0;
      return { ...c, count };
    })
  );

  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header active="collection" />
      </header>

      <main className="relative isolate min-h-screen px-4 py-14 sm:px-6">
        <ParallaxBg src="/images/fan-bg.jpg" />

        <div className="mx-auto max-w-6xl">
          <h1 className="text-center font-display text-4xl font-semibold uppercase tracking-wide text-white drop-shadow-sm sm:text-5xl">
            All Collections
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm leading-relaxed text-white/85">
            Discover our ceiling fan collections. Choose your favourite brand and explore every
            model in one place.
          </p>

          {items.length === 0 ? (
            <p className="mt-12 text-center text-sm text-white">Abhi koi collection nahi hai.</p>
          ) : (
            <div className="mx-auto mt-10 grid max-w-md grid-cols-1 gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {items.map((c) => (
                <Link
                  key={c.id}
                  href={c.href || "#"}
                  className="group block overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-3/4 overflow-hidden bg-neutral-100">
                    <Image
                      src={c.image}
                      alt={c.label}
                      fill
                      quality={90}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="border-t border-neutral-100 px-4 py-5 text-center">
                    <h2 className="text-base font-semibold uppercase tracking-wider text-neutral-900">
                      {c.label}
                    </h2>
                    <p className="mt-1 text-xs tracking-wide text-neutral-500">
                      {c.count} {c.count === 1 ? "Product" : "Products"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}