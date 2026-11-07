import type { NextRequest } from "next/server";
import { searchModels } from "@/lib/search";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 60);
  if (!q) return Response.json({ results: [], total: 0 });

  const hits = await searchModels(q, 200);

  return Response.json({
    total: hits.length,
    results: hits.slice(0, 8).map((h) => ({
      id: h.id,
      name: h.name,
      image: h.image,
      price: h.price,
      category: h.category,
      categoryLabel: h.categoryLabel,
    })),
  });
}