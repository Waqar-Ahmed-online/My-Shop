import { Schema, model, models } from "mongoose";

const FanCardSchema = new Schema(
  {
    image: { type: String, required: true },
    publicId: { type: String, required: true },
    label: { type: String, required: true },
    href: { type: String, default: "#" },
    group: { type: String, default: "fan" }, // "fan" ya "converter"
  },
  { timestamps: true }
);

// dev mein schema badalne par purana model hata do
if (process.env.NODE_ENV !== "production" && models.FanCard) {
  delete models.FanCard;
}

export default models.FanCard || model("FanCard", FanCardSchema);