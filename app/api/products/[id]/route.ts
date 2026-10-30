import { getProduct } from "@/lib/data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(Number(id));
  if (!product) return Response.json({ message: "Product not found" }, { status: 404 });
  return Response.json(product);
}
