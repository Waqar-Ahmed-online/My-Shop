import { Schema, model, models } from "mongoose";

const FanCardSchema = new Schema(
  {
    image: { type: String, required: true },
    publicId: { type: String, required: true },
    label: { type: String, required: true },
    href: { type: String, default: "#" },
  },
  { timestamps: true }
);

export default models.FanCard || model("FanCard", FanCardSchema);