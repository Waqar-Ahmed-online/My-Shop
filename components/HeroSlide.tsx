import Image from "next/image";
import type { Slide } from "@/types";

type Props = { slide: Slide; active: boolean; priority: boolean };

export default function HeroSlide({ slide, active, priority }: Props) {
  return (
    <div
      inert={!active}
      className={`absolute inset-0 transition-opacity duration-1000 ${active ? "opacity-100" : "opacity-0"}`}
    >
      <Image
        src={slide.image}
        alt={slide.title}
        fill
        priority={priority}
        quality={90}
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* upar thora dark taake transparent header ke white icons/logo saaf dikhein */}
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/25 to-black/50" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 pb-16 pt-24 text-center sm:px-6 sm:pb-0 sm:pt-20">
        <div className="flex w-full max-w-3xl flex-col items-center">
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-[#F4C152] sm:text-[0.7rem] sm:tracking-[0.3em]">
            {slide.eyebrow}
          </p>

          <h2 className="mt-3 max-w-full break-words font-display text-3xl font-semibold uppercase leading-tight text-[#F5F1E8] sm:text-5xl md:text-6xl">
            {slide.title}
          </h2>

          <div className="mt-6 flex w-full max-w-xs flex-col gap-3 sm:mt-8 sm:w-auto sm:max-w-none sm:flex-row">
            <button className="w-full bg-[#F4C152] px-8 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-[#111111] transition hover:bg-[#D9A441] sm:w-auto">
              [ {slide.primaryBtn} ]
            </button>

            <button className="w-full border border-[#F4C152] px-8 py-3.5 text-xs font-medium uppercase tracking-[0.25em] text-[#FFFFFF] transition hover:border-[#D9A441] hover:bg-[#D9A441] hover:text-[#111111] sm:w-auto">
              [ {slide.secondaryBtn} ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}