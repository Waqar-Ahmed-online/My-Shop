import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";

export async function uploadImage(file: File, folder: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (err, result) =>
        err || !result ? reject(err) : resolve(result)
      )
      .end(buffer);
  });
}
export function checkImage(file: File) {
  if (!file.type.startsWith("image/")) return "Sirf image file upload karo";
  if (file.size > 4 * 1024 * 1024) return "Image 4MB se choti honi chahiye";
  return null;
}