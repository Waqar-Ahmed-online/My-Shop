import Image from "next/image";
import Link from "next/link";
import type { FanCard } from "@/types";
import ParallaxBg from "./ParallaxBg";

export default function FanCards({ cards }: { cards: FanCard[] }) {
  if (cards.length === 0) return null;

  return (
    <section className="relative isolate px-4 py-14 sm:px-6">
      <ParallaxBg src="/images/fan-bg.jpg" overlay="bg-black/35" />

      <div className="mx-auto max-w-6xl">
        <p className="text-center text-[0.65rem] uppercase tracking-[0.3em] text-white/80">
          Cool Comfort
        </p>
        <h2 className="mt-2 text-center font-display text-4xl font-semibold uppercase tracking-wide text-white drop-shadow-sm sm:text-5xl">
          Ceiling Fan
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.id}
              href={c.href || "#"}
              aria-label={c.label}
              className="group relative block aspect-3/4 overflow-hidden border border-neutral-200 shadow-sm transition hover:shadow-lg"
            >
              <Image
                src={c.image}
                alt={c.label}
                fill
                quality={90}
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover object-center transition duration-700 group-hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}