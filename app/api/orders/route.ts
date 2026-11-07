import type { NextRequest } from "next/server";
import { after } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { sendMail } from "@/lib/mail";
import { adminEmail, customerEmail, type EmailOrder } from "@/lib/orderEmail";
import FanModelDoc from "@/models/FanModel";
import OrderModel from "@/models/Order";

type LeanModel = {
  _id: unknown;
  name: string;
  image: string;
  price?: number | null;
  inStock?: boolean;
  sizes?: string[];
  colors?: { name: string; image: string }[];
};

type OrderItem = {
  modelId: string;
  name: string;
  image: string;
  color: string;
  size: string;
  qty: number;
  price: number;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const err = (msg: string) => Response.json({ error: msg }, { status: 400 });

const clean = (v: unknown, max: number) =>
  String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

function makeOrderNo() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.floor(Math.random() * 36 ** 2)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `AB-${t}${r}`;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return err("Invalid request");

  // hidden field: only bots fill this in
  if (clean(body.website, 50)) {
    return Response.json({ orderNo: "AB-000000", total: 0, items: [] });
  }

  const name = clean(body.name, 60);
  const phone = clean(body.phone, 20);
  const email = clean(body.email, 80).toLowerCase();
  const city = clean(body.city, 40);
  const address = clean(body.address, 250);
  const note = clean(body.note, 300);
  const digits = phone.replace(/\D/g, "");

  if (name.length < 2) return err("Please enter your name");
  if (digits.length < 10 || digits.length > 13) {
    return err("Please enter a valid phone number (e.g. 0300 1234567)");
  }
  // email is optional; if provided, it must be valid
  // (to make it required, change this line to: if (!EMAIL_RE.test(email)) return err(...))
  if (email && !EMAIL_RE.test(email)) return err("Please enter a valid email (e.g. name@gmail.com)");
  if (city.length < 2) return err("Please enter your city");
  if (address.length < 8) return err("Please enter your complete address");

  const rawItems = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
  if (rawItems.length < 1 || rawItems.length > 30) return err("Your cart is empty");

  const wanted = rawItems.map((it) => ({
    modelId: String(it.modelId ?? ""),
    color: clean(it.color, 40),
    size: clean(it.size, 20),
    qty: Math.floor(Number(it.qty)),
  }));
  if (wanted.some((w) => !isValidObjectId(w.modelId) || !(w.qty >= 1 && w.qty <= 50))) {
    return err("Something in your cart is invalid. Please check your cart again.");
  }

  await connectDB();

  const ids = Array.from(new Set(wanted.map((w) => w.modelId)));
  const docs = (await FanModelDoc.find({ _id: { $in: ids } }).lean()) as unknown as LeanModel[];
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  const items: OrderItem[] = [];
  let total = 0;

  for (const w of wanted) {
    const m = byId.get(w.modelId);
    if (!m) return err("A product in your cart no longer exists. Please check your cart again.");
    if (m.inStock === false || m.price == null) {
      return err(`"${m.name}" is not available right now.`);
    }

    // price always comes from the database, never trust the price sent by the customer
    const color = m.colors?.find((c) => c.name === w.color);
    items.push({
      modelId: w.modelId,
      name: m.name,
      image: color?.image ?? m.image,
      color: color?.name ?? "",
      size: m.sizes?.includes(w.size) ? w.size : "",
      qty: w.qty,
      price: m.price,
    });
    total += m.price * w.qty;
  }

  let order: { orderNo: string } | null = null;
  for (let tries = 0; tries < 3; tries++) {
    try {
      order = await OrderModel.create({
        orderNo: makeOrderNo(),
        name,
        phone,
        email,
        city,
        address,
        note,
        items,
        total,
      });
      break;
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e; // retry only on an order number clash
    }
  }

  if (!order) {
    return Response.json({ error: "Order could not be saved, please try again" }, { status: 500 });
  }

  // send emails after the response so the customer doesn't have to wait
  const orderNo = order.orderNo;
  const origin = req.nextUrl.origin;
  after(async () => {
    try {
      const [totalOrders, newOrders] = await Promise.all([
        OrderModel.countDocuments(),
        OrderModel.countDocuments({ status: "new" }),
      ]);

      const eo: EmailOrder = {
        orderNo,
        name,
        phone,
        email,
        city,
        address,
        note,
        items,
        total,
        createdAt: new Date(),
      };

      const shopWa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923493032515";
      const adminTo = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      const jobs: Promise<boolean>[] = [];

      if (adminTo) {
        const m = adminEmail(eo, { total: totalOrders, fresh: newOrders }, `${origin}/admin/orders`);
        jobs.push(sendMail({ to: adminTo, ...m, replyTo: email || undefined }));
      }
      if (email) {
        const m = customerEmail(eo, shopWa);
        jobs.push(sendMail({ to: email, ...m }));
      }

      await Promise.all(jobs);
    } catch (e) {
      console.error("[orders] email job failed:", e);
    }
  });

  return Response.json(
    {
      orderNo,
      total,
      items: items.map((i) => ({
        name: i.name,
        color: i.color,
        size: i.size,
        qty: i.qty,
        price: i.price,
      })),
    },
    { status: 201 }
  );
}