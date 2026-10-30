import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import FanModelDoc from "@/models/FanModel";

type Ctx = { params: Promise<{ id: string; colorId: string }> };

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