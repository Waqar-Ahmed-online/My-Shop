import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { checkImage, uploadImage } from "@/lib/upload";
import FanCardModel from "@/models/FanCard";

export async function GET() {
  await connectDB();
  const docs = await FanCardModel.find().sort({ createdAt: 1 }).lean();
  return Response.json(docs.map((d) => ({ ...d, _id: String(d._id) })));
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image") as File | null;
  const label = String(form.get("label") ?? "").trim();

  if (!file || file.size === 0 || !label) {
    return Response.json({ error: "Image aur label zaroori hain" }, { status: 400 });
  }
const bad = checkImage(file);
if (bad) return Response.json({ error: bad }, { status: 400 });
  await connectDB();
  if ((await FanCardModel.countDocuments()) >= 3) {
    return Response.json(
      { error: "Sirf 3 cards ho sakte hain. Pehle koi delete karo." },
      { status: 400 }
    );
  }

  const uploaded = await uploadImage(file, "abrar-electronics/cards");
  const card = await FanCardModel.create({
    image: uploaded.secure_url,
    publicId: uploaded.public_id,
    label,
    href: String(form.get("href") || "#"),
  });

  revalidateTag("fan-cards", { expire: 0 });
  return Response.json(card, { status: 201 });
}