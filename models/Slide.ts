import { Schema, model, models } from "mongoose";

const SlideSchema = new Schema(
  {
    image: { type: String, required: true },
    publicId: { type: String, required: true },
    mobileImage: { type: String, default: "" },
    mobilePublicId: { type: String, default: "" },
    eyebrow: { type: String, default: "" },
    title: { type: String, required: true },
    primaryBtn: { type: String, default: "Shop Now" },
    secondaryBtn: { type: String, default: "View Deals" },
  },
  { timestamps: true }
);

// dev mein schema badalne par purana model hata do, naya bane
if (process.env.NODE_ENV !== "production" && models.Slide) {
  delete models.Slide;
}

export default models.Slide || model("Slide", SlideSchema);