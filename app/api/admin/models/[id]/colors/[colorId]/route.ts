import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import { checkImage, uploadImage } from "@/lib/upload";
import FanModelDoc from "@/models/FanModel";

type Ctx = { params: Promise<{ id: string; colorId: string }> };
const HEX = /^#[0-9a-fA-F]{6}$/;

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id, colorId } = await params;
  const form = await req.formData();
  const name = String(form.get("name") ?? "").trim();
  const hexRaw = String(form.get("hex") ?? "");
  const hex2Raw = String(form.get("hex2") ?? "");

  if (!name) {
    return Response.json({ error: "Color ka naam zaroori hai" }, { status: 400 });
  }

  await connectDB();
  const doc = await FanModelDoc.findById(id);
  if (!doc) return Response.json({ error: "Model nahi mila" }, { status: 404 });

  const color = doc.colors.id(colorId);
  if (!color) return Response.json({ error: "Color nahi mila" }, { status: 404 });

  // nayi image di ho to pehle upload, save ke baad purani hatao
  let oldPublicId: string | null = null;
  const file = form.get("image") as File | null;
  if (file && file.size > 0) {
    const bad = checkImage(file);
    if (bad) return Response.json({ error: bad }, { status: 400 });
    const uploaded = await uploadImage(file, "abrar-electronics/colors");
    oldPublicId = color.publicId;
    color.image = uploaded.secure_url;
    color.publicId = uploaded.public_id;
  }

  color.name = name;
  color.hex = HEX.test(hexRaw) ? hexRaw : "#cccccc";
  color.hex2 = HEX.test(hex2Raw) ? hex2Raw : "";
  await doc.save();

  if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);

  revalidateTag("fan-models", { expire: 0 });
  return Response.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id, colorId } = await params;

  await connectDB();
  const doc = await FanModelDoc.findById(id);
  if (!doc) return Response.json({ error: "Model nahi mila" }, { status: 404 });

  const color = doc.colors.id(colorId);
  if (!color) return Response.json({ error: "Color nahi mila" }, { status: 404 });

  await cloudinary.uploader.destroy(color.publicId);
  doc.colors.pull({ _id: colorId });
  await doc.save();

  revalidateTag("fan-models", { expire: 0 });
  return Response.json({ ok: true });
}