"use client";

import { useEffect, useState } from "react";
import type { Slide } from "@/types";
import HeroSlide from "./HeroSlide";
import HeroArrows from "./HeroArrows";
import HeroDots from "./HeroDots";

export default function Hero({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [startX, setStartX] = useState<number | null>(null);
  const total = slides.length;

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // har 5 sec baad agli slide; index badalne par timer dobara shuru hota hai
  useEffect(() => {
    if (total === 0) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % total), 5000);
    return () => clearInterval(t);
  }, [index, total]);

  if (total === 0) return null;

  // mobile swipe: left swipe = next, right swipe = previous
  function onTouchEnd(e: React.TouchEvent) {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next();
      else prev();
    }
    setStartX(null);
  }

  return (
    <section
      onTouchStart={(e) => setStartX(e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
      className="relative h-svh min-h-[560px] overflow-hidden bg-neutral-900 text-white sm:h-[85vh] sm:min-h-[500px]"
    >
      {slides.map((s, i) => (
        <HeroSlide key={s.id} slide={s} active={i === index} priority={i === 0} />
      ))}
      <HeroArrows onPrev={prev} onNext={next} />
      <HeroDots total={total} current={index} onSelect={setIndex} />
    </section>
  );
}