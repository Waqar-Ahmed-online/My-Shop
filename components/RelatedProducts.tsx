import Image from "next/image";
import Link from "next/link";
import { getFanModels } from "@/lib/data";
import { rs } from "@/lib/format";

export default async function RelatedProducts({
  category,
  currentId,
  label,
  group = "fan",
  limit = 8,
}: {
  category: string;
  currentId: string;
  label: string;
  group?: string;
  limit?: number; // kitne products dikhane hain
}) {
  const all = await getFanModels(category);

  // jo khula hai uske baad wale pehle, phir shuru wale (har product par alag list aaye)
  const idx = all.findIndex((m) => m.id === currentId);
  const ordered = idx >= 0 ? [...all.slice(idx + 1), ...all.slice(0, idx)] : all;
  const items = ordered.slice(0, limit)

  if (items.length === 0) return null;

   const frame =
    group === "converter"
      ? "aspect-3/4"
      : group === "charger" || group === "solar"
        ? "aspect-4/3"
        : "aspect-square";
  const fillPhoto = group !== "fan"; // converter ki photos lambi hoti hain

  return (
    <section className="mt-16 border-t border-neutral-200 pt-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold uppercase tracking-wide text-neutral-900 sm:text-3xl">
          More from {label}
        </h2>
        <Link
          href={`/${category}`}
          className="shrink-0 text-xs uppercase tracking-widest text-neutral-500 transition hover:text-gold-dark"
        >
          View all ({all.length})
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {items.map((m) => {
          const discount =
            m.oldPrice !== null && m.price !== null && m.oldPrice > m.price
              ? Math.round(((m.oldPrice - m.price) / m.oldPrice) * 100)
              : 0;

          return (
            <Link
              key={m.id}
              href={`/${category}/${m.id}`}
              className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
                            <div className={`relative bg-white ${frame}`}>
                {discount > 0 && m.inStock && (
                  <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    -{discount}%
                  </span>
                )}
                {!m.inStock && (
                  <span className="absolute left-2 top-2 z-10 rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Out of Stock
                  </span>
                )}
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  quality={90}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className={`${
                                       fillPhoto ? "object-cover" : "object-contain p-2"
                  } transition duration-500 group-hover:scale-105 ${
                    m.inStock ? "" : "opacity-50"
                  }`}
                />
              </div>

              <div className="border-t border-neutral-100 p-3 text-center">
                <h3 className="line-clamp-2 min-h-9 text-xs font-semibold uppercase leading-[18px] tracking-wide text-neutral-900">
                  {m.name}
                </h3>
                <p className="mt-1 flex flex-wrap items-baseline justify-center gap-x-2 text-sm">
                  {m.price !== null && (
                    <span className="font-bold text-neutral-900">{rs(m.price)}</span>
                  )}
                  {m.oldPrice !== null && (
                    <span className="text-xs text-neutral-400 line-through">
                      {rs(m.oldPrice)}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}