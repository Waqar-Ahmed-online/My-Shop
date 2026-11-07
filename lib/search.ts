import { getFanCards, getFanModels } from "@/lib/data";
import { FAN_TYPES, getFanType } from "@/lib/fanTypes";
import type { FanModel } from "@/types";

export type SearchHit = FanModel & { categoryLabel: string; group: string };

// naam, card ke naam (SK, Khurshid...) aur pankhon ke type (Inverter...) mein dhoondta hai.
// lafz kisi bhi tarteeb mein ho sakte hain, jaise "oval 2500" se "Oval Gold 2500W" milta hai
export async function searchModels(q: string, limit = 50): Promise<SearchHit[]> {
  const phrase = q.trim().toLowerCase();
  const words = phrase.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const [cards, models] = await Promise.all([getFanCards(), getFanModels()]);
  const cardBySlug = new Map(cards.map((c) => [c.href.replace(/^\//, ""), c]));

  const scored: { m: FanModel; score: number; label: string; group: string }[] = [];

  for (const m of models) {
    const card = cardBySlug.get(m.category);
    if (!card) continue; // card hata diya ho to uska page nahi khulta

    const group = card.group || "fan";
    const typeLabel =
      group === "fan" ? (FAN_TYPES.find((t) => t.value === getFanType(m))?.label ?? "") : "";
    const name = m.name.toLowerCase();
    const hay = `${name} ${card.label.toLowerCase()} ${typeLabel.toLowerCase()}`;

    if (!words.every((w) => hay.includes(w))) continue;

    let score = 0;
    if (name.startsWith(phrase)) score = 3;
    else if (name.includes(phrase)) score = 2;
    else if (words.every((w) => name.includes(w))) score = 1;

    scored.push({ m, score, label: card.label, group });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.m.name.localeCompare(b.m.name, undefined, { numeric: true })
  );

  return scored
    .slice(0, limit)
    .map(({ m, label, group }) => ({ ...m, categoryLabel: label, group }));
}
export type Deal = SearchHit & { discount: number; saving: number };

// wo products jin par discount hai (purani price > asli price), sab se zyada discount pehle
export async function getDeals(): Promise<Deal[]> {
  const [cards, models] = await Promise.all([getFanCards(), getFanModels()]);
  const cardBySlug = new Map(cards.map((c) => [c.href.replace(/^\//, ""), c]));

  const deals: Deal[] = [];
  for (const m of models) {
    const card = cardBySlug.get(m.category);
    if (!card) continue; // card hata diya ho to uska page nahi khulta
    if (!m.inStock) continue; // out of stock deals mein nahi
    if (m.price === null || m.oldPrice === null || m.oldPrice <= m.price) continue;

    const saving = m.oldPrice - m.price;
    deals.push({
      ...m,
      categoryLabel: card.label,
      group: card.group || "fan",
      saving,
      discount: Math.round((saving / m.oldPrice) * 100),
    });
  }

  deals.sort((a, b) => b.discount - a.discount || b.saving - a.saving);
  return deals;
}