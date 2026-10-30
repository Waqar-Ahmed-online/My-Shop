import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import ModelView from "@/components/ModelView";
import { getFanCards, getFanModel, getFanModels } from "@/lib/data";

export async function generateStaticParams() {
  const models = await getFanModels();
  if (models.length === 0) return [{ category: "sk-fan-categories", model: "none" }];
  return models.map((m) => ({ category: m.category, model: m.id }));
}

async function Content({
  params,
}: {
  params: Promise<{ category: string; model: string }>;
}) {
  const { category, model } = await params;

  const [cards, data] = await Promise.all([getFanCards(), getFanModel(model)]);
  const card = cards.find((c) => c.href === `/${category}`);
  if (!card || !data || data.category !== category) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <nav className="mb-8 text-xs uppercase tracking-widest text-neutral-500">
        <Link href="/" className="hover:text-gold-dark">Home</Link>
        {" / "}
        <Link href={card.href} className="hover:text-gold-dark">{card.label}</Link>
        {" / "}
        <span className="text-neutral-900">{data.name}</span>
      </nav>
      <ModelView model={data} category={{ label: card.label, href: card.href }} />
    </div>
  );
}

export default function ModelPage(props: PageProps<"/[category]/[model]">) {
  return (
    <>
    <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header />
      </header>
      <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
        <Suspense fallback={<p className="text-center text-neutral-500">Loading...</p>}>
          <Content params={props.params} />
        </Suspense>
      </main>
    </>
  );
}