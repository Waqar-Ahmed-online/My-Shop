import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FanCards from "@/components/FanCards";
import { getFanCards, getSlides } from "@/lib/data";

export default async function Home() {
  const [slides, cards] = await Promise.all([getSlides(), getFanCards()]);

  const fanCards = cards.filter((c) => c.group !== "converter");
  const converterCards = cards.filter((c) => c.group === "converter");

  return (
    <>
      {/* Transparent header: hero ke upar overlay (mobile + desktop dono) */}
      <header data-overlay className="absolute inset-x-0 top-0 z-30 text-white">
        <Header />
      </header>
      <main>
        <Hero slides={slides} />
               <FanCards cards={fanCards} eyebrow="Cool Comfort" title="Ceiling Fan" bg="/images/fan-bg.jpg" />
                       <FanCards cards={converterCards} title="Collection" light />
      </main>
    </>
  );
}