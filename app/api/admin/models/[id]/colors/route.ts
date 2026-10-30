import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { checkImage, uploadImage } from "@/lib/upload";
import FanModelDoc from "@/models/FanModel";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const form = await req.formData();
  const file = form.get("image") as File | null;
  const name = String(form.get("name") ?? "").trim();
  const hex = String(form.get("hex") || "#cccccc");

  if (!file || file.size === 0 || !name) {
    return Response.json({ error: "Color ka naam aur image zaroori hain" }, { status: 400 });
  }
const bad = checkImage(file);
if (bad) return Response.json({ error: bad }, { status: 400 });
  await connectDB();
  const doc = await FanModelDoc.findById(id);
  if (!doc) return Response.json({ error: "Model nahi mila" }, { status: 404 });

  const uploaded = await uploadImage(file, "abrar-electronics/colors");
  doc.colors.push({
    name,
    hex,
    image: uploaded.secure_url,
    publicId: uploaded.public_id,
  });
  await doc.save();

  revalidateTag("fan-models", { expire: 0 });
  return Response.json({ ok: true }, { status: 201 });
}