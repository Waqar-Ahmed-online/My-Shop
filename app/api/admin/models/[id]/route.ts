import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import { checkImage, uploadImage } from "@/lib/upload";
import FanModelDoc from "@/models/FanModel";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const priceRaw = String(form.get("price") ?? "").trim();
  const oldRaw = String(form.get("oldPrice") ?? "").trim();
    const sizes = String(form.get("sizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const inStock = form.get("inStock") !== "0";

  if (!name || !category) {
    return Response.json({ error: "Category aur naam zaroori hain" }, { status: 400 });
  }

  await connectDB();
  const doc = await FanModelDoc.findById(id);
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  const file = form.get("image") as File | null;
  if (file && file.size > 0) {
    const bad = checkImage(file);
if (bad) return Response.json({ error: bad }, { status: 400 });
    const uploaded = await uploadImage(file, "abrar-electronics/models");
    await cloudinary.uploader.destroy(doc.publicId);
    doc.image = uploaded.secure_url;
    doc.publicId = uploaded.public_id;
  }

  doc.name = name;
  doc.category = category;
  doc.price = priceRaw ? Number(priceRaw) : null;
  doc.oldPrice = oldRaw ? Number(oldRaw) : null;
    doc.sizes = sizes;
  doc.inStock = inStock;
  await doc.save();

  revalidateTag("fan-models", { expire: 0 });
  return Response.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectDB();
  const doc = await FanModelDoc.findByIdAndDelete(id);
  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });

  // model aur uske sab colors ki images Cloudinary se hatao
  await cloudinary.uploader.destroy(doc.publicId);
  for (const c of doc.colors) await cloudinary.uploader.destroy(c.publicId);

  revalidateTag("fan-models", { expire: 0 });
  return Response.json({ ok: true });
}