import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OrderModel from "@/models/Order";

type Ctx = { params: Promise<{ id: string }> };
const STATUSES = ["new", "confirmed", "delivered", "cancelled"];

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string };

  if (!body.status || !STATUSES.includes(body.status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();
  const order = await OrderModel.findByIdAndUpdate(id, { status: body.status });
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  return Response.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  await connectDB();
  const order = await OrderModel.findByIdAndDelete(id);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  return Response.json({ ok: true });
}