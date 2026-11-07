import Image from "next/image";
import Link from "next/link";
import { rs } from "@/lib/format";

export type CardItem = {
  id: string;
  name: string;
  image: string;
  price: number | null;
  oldPrice: number | null;
  category: string;
  categoryLabel: string;
  group: string;
  inStock: boolean;
};

export default function ProductCard({
  m,
  priority = false,
  showSaving = false,
}: {
  m: CardItem;
  priority?: boolean;
  showSaving?: boolean;
}) {
  // pankhon ki photos safed background par chaori hoti hain (poori dikhao),
  // baqi sections ki photos dabba bhar kar dikhao
  const isFan = m.group === "fan";

  const discount =
    m.price !== null && m.oldPrice !== null && m.oldPrice > m.price
      ? Math.round(((m.oldPrice - m.price) / m.oldPrice) * 100)
      : 0;
  const saving = discount > 0 ? (m.oldPrice as number) - (m.price as number) : 0;

  return (
    <Link
      href={`/${m.category}/${m.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* photo: hamesha choras, taake sab cards barabar rahen */}
      <div className="relative aspect-square bg-white">
        {discount > 0 && m.inStock && (
          <span className="absolute left-2 top-2 z-10 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
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
          priority={priority}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={`${
            isFan ? "object-contain p-2" : "object-cover object-[center_30%]"
          } transition duration-500 group-hover:scale-105 ${m.inStock ? "" : "opacity-50"}`}
        />
      </div>

      {/* tafseel: naam upar, price hamesha neeche */}
      <div className="flex flex-1 flex-col border-t border-neutral-100 p-3 text-center">
        <p className="text-[10px] uppercase tracking-widest text-neutral-400">
          {m.categoryLabel}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-9 text-xs font-semibold uppercase leading-[18px] tracking-wide text-neutral-900">
          {m.name}
        </h3>

        <div className="mt-auto pt-2">
          <p className="flex flex-wrap items-baseline justify-center gap-x-2 text-sm">
            {m.price !== null && (
              <span className="font-bold text-neutral-900">{rs(m.price)}</span>
            )}
            {m.oldPrice !== null && (
              <span className="text-xs text-neutral-400 line-through">{rs(m.oldPrice)}</span>
            )}
          </p>
          {showSaving && saving > 0 && (
            <p className="mt-1 text-xs font-semibold text-green-600">Save {rs(saving)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}