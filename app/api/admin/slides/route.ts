import type { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import SlideModel from "@/models/Slide";
import { checkImage, uploadImage } from "@/lib/upload";

const FOLDER = "abrar-electronics/hero";

export async function GET() {
  await connectDB();
  const docs = await SlideModel.find().sort({ createdAt: 1 }).lean();
  return Response.json(docs.map((d) => ({ ...d, _id: String(d._id) })));
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("image") as File | null;
  const mobile = form.get("mobileImage") as File | null;
  const mobileFile = mobile && mobile.size > 0 ? mobile : null;
  const title = String(form.get("title") ?? "").trim();

  if (!file || file.size === 0 || !title) {
    return Response.json({ error: "Laptop image and title are required" }, { status: 400 });
  }

  // check both images before uploading
  const bad = checkImage(file);
  if (bad) return Response.json({ error: `Laptop image: ${bad}` }, { status: 400 });
  if (mobileFile) {
    const badM = checkImage(mobileFile);
    if (badM) return Response.json({ error: `Mobile image: ${badM}` }, { status: 400 });
  }

  const uploaded = await uploadImage(file, FOLDER);
  const uploadedMobile = mobileFile ? await uploadImage(mobileFile, FOLDER) : null;

  await connectDB();
  const slide = await SlideModel.create({
    image: uploaded.secure_url,
    publicId: uploaded.public_id,
    mobileImage: uploadedMobile?.secure_url ?? "",
    mobilePublicId: uploadedMobile?.public_id ?? "",
    title,
    eyebrow: String(form.get("eyebrow") ?? ""),
    primaryBtn: String(form.get("primaryBtn") || "Shop Now"),
    secondaryBtn: String(form.get("secondaryBtn") || "View Deals"),
  });

  revalidateTag("slides", { expire: 0 });
  return Response.json(slide, { status: 201 });
}