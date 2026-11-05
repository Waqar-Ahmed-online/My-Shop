import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import { checkImage, uploadImage } from "@/lib/upload";
import FanCardModel from "@/models/FanCard";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const form = await req.formData();
  const label = String(form.get("label") ?? "").trim();
  if (!label) return Response.json({ error: "Label zaroori hai" }, { status: 400 });

  await connectDB();
  const card = await FanCardModel.findById(id);
  if (!card) return Response.json({ error: "Not found" }, { status: 404 });

  const file = form.get("image") as File | null;
  if (file && file.size > 0) {
    const bad = checkImage(file);
if (bad) return Response.json({ error: bad }, { status: 400 });
    const uploaded = await uploadImage(file, "abrar-electronics/cards");
    await cloudinary.uploader.destroy(card.publicId);
    card.image = uploaded.secure_url;
    card.publicId = uploaded.public_id;
  }

  card.label = label;
  card.href = String(form.get("href") || "#");
    card.group = String(form.get("group") ?? "fan") === "converter" ? "converter" : "fan";
  await card.save();

  revalidateTag("fan-cards", { expire: 0 });
  return Response.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectDB();
  const card = await FanCardModel.findByIdAndDelete(id);
  if (!card) return Response.json({ error: "Not found" }, { status: 404 });

  await cloudinary.uploader.destroy(card.publicId);
  revalidateTag("fan-cards", { expire: 0 });
  return Response.json({ ok: true });
}