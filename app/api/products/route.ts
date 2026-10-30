import type { NextRequest } from "next/server";
import { getProducts } from "@/lib/data";

// GET /api/products  or  /api/products?q=fan
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  return Response.json(await getProducts(q));
}
