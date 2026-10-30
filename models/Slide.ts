import { Schema, model, models } from "mongoose";

const SlideSchema = new Schema(
  {
    image: { type: String, required: true },
    publicId: { type: String, required: true },
    eyebrow: { type: String, default: "" },
    title: { type: String, required: true },
    primaryBtn: { type: String, default: "Shop Now" },
    secondaryBtn: { type: String, default: "View Deals" },
  },
  { timestamps: true }
);

export default models.Slide || model("Slide", SlideSchema);