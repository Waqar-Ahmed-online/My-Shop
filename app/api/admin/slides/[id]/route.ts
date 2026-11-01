import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import SlideModel from "@/models/Slide";
import { checkImage, uploadImage } from "@/lib/upload";

const FOLDER = "abrar-electronics/hero";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  const file = form.get("image") as File | null;
  const desktopFile = file && file.size > 0 ? file : null;
  const mobile = form.get("mobileImage") as File | null;
  const mobileFile = mobile && mobile.size > 0 ? mobile : null;
  const removeMobile = form.get("removeMobile") === "1";

  if (!title) {
    return Response.json({ error: "Title zaroori hai" }, { status: 400 });
  }
  if (desktopFile) {
    const bad = checkImage(desktopFile);
    if (bad) return Response.json({ error: `Laptop image: ${bad}` }, { status: 400 });
  }
  if (mobileFile) {
    const bad = checkImage(mobileFile);
    if (bad) return Response.json({ error: `Mobile image: ${bad}` }, { status: 400 });
  }

  await connectDB();
  const slide = await SlideModel.findById(id);
  if (!slide) return Response.json({ error: "Not found" }, { status: 404 });

  // purani images save hone ke baad hatayenge
  const toDestroy: string[] = [];

  if (desktopFile) {
    const uploaded = await uploadImage(desktopFile, FOLDER);
    toDestroy.push(slide.publicId);
    slide.image = uploaded.secure_url;
    slide.publicId = uploaded.public_id;
  }

  if (mobileFile) {
    const uploaded = await uploadImage(mobileFile, FOLDER);
    if (slide.mobilePublicId) toDestroy.push(slide.mobilePublicId);
    slide.mobileImage = uploaded.secure_url;
    slide.mobilePublicId = uploaded.public_id;
  } else if (removeMobile && slide.mobilePublicId) {
    toDestroy.push(slide.mobilePublicId);
    slide.mobileImage = "";
    slide.mobilePublicId = "";
  }

  slide.title = title;
  slide.eyebrow = String(form.get("eyebrow") ?? "");
  slide.primaryBtn = String(form.get("primaryBtn") || "Shop Now");
  slide.secondaryBtn = String(form.get("secondaryBtn") || "View Deals");
  await slide.save();

     for (const pid of toDestroy) await cloudinary.uploader.destroy(pid);

  revalidateTag("slides", { expire: 0 });
  return Response.json({ ok: true, mobileImage: slide.mobileImage ?? "" });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectDB();
  const slide = await SlideModel.findByIdAndDelete(id);
  if (!slide) return Response.json({ error: "Not found" }, { status: 404 });

  await cloudinary.uploader.destroy(slide.publicId);
  if (slide.mobilePublicId) await cloudinary.uploader.destroy(slide.mobilePublicId);

  revalidateTag("slides", { expire: 0 });
  return Response.json({ ok: true });
}