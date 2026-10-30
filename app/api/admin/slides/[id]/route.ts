import type { NextRequest } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import SlideModel from "@/models/Slide";
import { checkImage } from "@/lib/upload";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();

  if (!title) {
    return Response.json({ error: "Title zaroori hai" }, { status: 400 });
  }

  await connectDB();
  const slide = await SlideModel.findById(id);
  if (!slide) return Response.json({ error: "Not found" }, { status: 404 });

  // nayi image di hai to upload karo, purani delete karo
  const file = form.get("image") as File | null;
  if (file && file.size > 0) {
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

    await cloudinary.uploader.destroy(slide.publicId);
    slide.image = uploaded.secure_url;
    slide.publicId = uploaded.public_id;
  }

  slide.title = title;
  slide.eyebrow = String(form.get("eyebrow") ?? "");
  slide.primaryBtn = String(form.get("primaryBtn") || "Shop Now");
  slide.secondaryBtn = String(form.get("secondaryBtn") || "View Deals");
  await slide.save();

  revalidateTag("slides", { expire: 0 });
  return Response.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectDB();
  const slide = await SlideModel.findByIdAndDelete(id);
  if (!slide) return Response.json({ error: "Not found" }, { status: 404 });

  await cloudinary.uploader.destroy(slide.publicId);
  revalidateTag("slides", { expire: 0 });
  return Response.json({ ok: true });
}