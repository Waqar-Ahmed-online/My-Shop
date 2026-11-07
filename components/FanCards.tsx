import Image from "next/image";
import Link from "next/link";
import type { FanCard } from "@/types";
import ParallaxBg from "./ParallaxBg";

export default function FanCards({
  cards,
  eyebrow,
  title,
  bg,
  light = false,
}: {
  cards: FanCard[];
  eyebrow?: string;
  title: string;
  bg?: string; // path of the background image
  light?: boolean; // true = white background and black heading
}) {
  if (cards.length === 0) return null;

  return (
    <section
      className={`relative isolate px-4 py-14 sm:px-6 ${
        light ? "bg-white" : ""
      }`}
    >
      {!light &&
        (bg ? (
          <ParallaxBg src={bg} />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-linear-to-b from-[#0b1f3a] via-[#10294a] to-[#071426]"
          />
        ))}

      <div className="mx-auto max-w-6xl">
        {eyebrow && (
          <p
            className={`text-center text-[0.65rem] uppercase tracking-[0.3em] ${
              light ? "text-neutral-500" : "text-white/80"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={`text-center font-display text-4xl font-semibold uppercase tracking-wide sm:text-5xl ${
            light ? "text-neutral-900" : "text-white drop-shadow-sm"
          } ${eyebrow ? "mt-2" : ""}`}
        >
          {title}
        </h2>
        {light && <div className="mx-auto mt-4 h-0.5 w-16 bg-brand" />}

        {/* -mx-2.5 and p-2.5 create a 20px gap between the cards */}
        <div className="-mx-2.5 mt-10 flex flex-wrap justify-center">
          {cards.map((c) => (
            <div key={c.id} className="w-full max-w-md p-2.5 md:w-1/3 md:max-w-none">
              <Link
                href={c.href || "#"}
                aria-label={c.label}
                className="group relative block aspect-3/4 overflow-hidden border border-neutral-200 shadow-md transition hover:shadow-xl"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}