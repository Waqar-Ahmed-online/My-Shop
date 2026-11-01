import { Suspense } from "react";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import CategoryView from "@/components/CategoryView";
import ParallaxBg from "@/components/ParallaxBg";
import { getFanCards, getFanModels } from "@/lib/data";

export async function generateStaticParams() {
  const cards = await getFanCards();
  const slugs = cards
    .map((c) => c.href.replace(/^\//, ""))
    .filter((s) => s && s !== "#");

  // build ke liye kam az kam 1 param chahiye
  return (slugs.length ? slugs : ["sk-fan-categories"]).map((category) => ({ category }));
}

async function Content({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;

  const cards = await getFanCards();
  const card = cards.find((c) => c.href === `/${category}`);
  if (!card) notFound();

  const models = await getFanModels(category);

  return <CategoryView label={card.label} category={category} models={models} />;
}

export default function CategoryPage(props: PageProps<"/[category]">) {
  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header />
      </header>
      <main className="relative isolate min-h-screen px-4 py-14 sm:px-6">
        <ParallaxBg src="/images/fan-bg.jpg" overlay="bg-black/35" />
        <Suspense fallback={<p className="text-center text-white">Loading...</p>}>
          <Content params={props.params} />
        </Suspense>
      </main>
    </>
  );
}