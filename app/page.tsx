import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FanCards from "@/components/FanCards";
import { getFanCards, getSlides } from "@/lib/data";

export default async function Home() {
  const [slides, cards] = await Promise.all([getSlides(), getFanCards()]);

  return (
    <>
      {/* Transparent header: hero ke upar overlay (mobile + desktop dono) */}
      <header className="absolute inset-x-0 top-0 z-30 text-white">
        <Header />
      </header>
      <main>
        <Hero slides={slides} />
        <FanCards cards={cards} />
      </main>
    </>
  );
}