import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { checkImage, uploadImage } from "@/lib/upload";
import FanModelDoc from "@/models/FanModel";
import { FAN_TYPES } from "@/lib/fanTypes";

export async function GET() {
  await connectDB();
  const docs = await FanModelDoc.find().sort({ createdAt: 1 }).lean();
  return Response.json(docs.map((d) => ({ ...d, _id: String(d._id) })));
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image") as File | null;
  const name = String(form.get("name") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").trim();
  const oldRaw = String(form.get("oldPrice") ?? "").trim();
  const sizes = String(form.get("sizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const inStock = form.get("inStock") !== "0";
  const fanTypeRaw = String(form.get("fanType") ?? "");
  const fanType = FAN_TYPES.some((t) => t.value === fanTypeRaw) ? fanTypeRaw : "";

  if (!file || file.size === 0 || !name || !category) {
    return Response.json({ error: "Category, image and name are required" }, { status: 400 });
  }
  const bad = checkImage(file);
  if (bad) return Response.json({ error: bad }, { status: 400 });
  const uploaded = await uploadImage(file, "abrar-electronics/models");

  await connectDB();
  const doc = await FanModelDoc.create({
    category,
    fanType,
    name,
    price: priceRaw ? Number(priceRaw) : null,
    oldPrice: oldRaw ? Number(oldRaw) : null,
    sizes,
    inStock,
    image: uploaded.secure_url,
    publicId: uploaded.public_id,
  });

  revalidateTag("fan-models", { expire: 0 });
  return Response.json(doc, { status: 201 });
}