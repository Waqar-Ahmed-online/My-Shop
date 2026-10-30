import type { NextRequest } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import SlideModel from "@/models/Slide";
import { checkImage } from "@/lib/upload";


export async function GET() {
  await connectDB();
  const docs = await SlideModel.find().sort({ createdAt: 1 }).lean();
  return Response.json(
    docs.map((d) => ({ ...d, _id: String(d._id) }))
  );
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image") as File | null;
  const title = String(form.get("title") ?? "").trim();

  if (!file || file.size === 0 || !title) {
    return Response.json({ error: "Image aur title zaroori hain" }, { status: 400 });
  }
  const bad = checkImage(file);
if (bad) return Response.json({ error: bad }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "abrar-electronics/hero" }, (err, result) =>
        err || !result ? reject(err) : resolve(result)
      )
      .end(buffer);
  });

  await connectDB();
  const slide = await SlideModel.create({
    image: uploaded.secure_url,
    publicId: uploaded.public_id,
    title,
    eyebrow: String(form.get("eyebrow") ?? ""),
    primaryBtn: String(form.get("primaryBtn") || "Shop Now"),
    secondaryBtn: String(form.get("secondaryBtn") || "View Deals"),
  });

  revalidateTag("slides", { expire: 0 });
  return Response.json(slide, { status: 201 });
}