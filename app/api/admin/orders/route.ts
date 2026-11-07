import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

export async function GET() {
  await connectDB();
  const docs = await OrderModel.find().sort({ createdAt: -1 }).limit(300).lean();
  return Response.json(docs.map((d) => ({ ...d, _id: String(d._id) })));
}