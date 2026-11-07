import { Schema, model, models } from "mongoose";

const ItemSchema = new Schema(
  {
    modelId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    city: { type: String, required: true },
    address: { type: String, required: true },
    note: { type: String, default: "" },
    items: { type: [ItemSchema], default: [] },
    total: { type: Number, required: true },
    status: { type: String, default: "new" }, // new, confirmed, delivered, cancelled
  },
  { timestamps: true }
);

// dev mein schema badalne par purana model hata do
if (process.env.NODE_ENV !== "production" && models.Order) {
  delete models.Order;
}

export default models.Order || model("Order", OrderSchema);