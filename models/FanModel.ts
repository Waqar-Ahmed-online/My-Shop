import { Schema, model, models } from "mongoose";

const ColorSchema = new Schema({
  name: { type: String, required: true },
  hex: { type: String, default: "#cccccc" },
  image: { type: String, required: true },
  publicId: { type: String, required: true },
});

const FanModelSchema = new Schema(
  {
    category: { type: String, required: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, default: null },
    oldPrice: { type: Number, default: null },
    image: { type: String, required: true },
    publicId: { type: String, required: true },
    sizes: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    colors: { type: [ColorSchema], default: [] },
  },
  { timestamps: true }
);

// dev me schema badalne par purana model hata do, naya bane
if (process.env.NODE_ENV !== "production" && models.FanModel) {
  delete models.FanModel;
}

// production me pehle se bana hua model dobara use karo
export default models.FanModel || model("FanModel", FanModelSchema);