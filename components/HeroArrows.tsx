import { ChevronLeft, ChevronRight } from "lucide-react";

const btn =
  "absolute top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/60 sm:block";

export default function HeroArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <>
      <button onClick={onPrev} aria-label="Previous slide" className={`${btn} left-4`}>
        <ChevronLeft size={22} />
      </button>
      <button onClick={onNext} aria-label="Next slide" className={`${btn} right-4`}>
        <ChevronRight size={22} />
      </button>
    </>
  );
}