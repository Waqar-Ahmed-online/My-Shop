"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  _id: string;
  orderNo: string;
  name: string;
  city: string;
  total: number;
  status: string;
  createdAt: string;
};

const money = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

const tiles = [
  { href: "/admin/orders", title: "Orders", text: "Orders received from the website and their status" },
  { href: "/admin/slides", title: "Hero Slides", text: "Images and text for the home page slider" },
  { href: "/admin/cards", title: "Ceiling Fan", text: "Ceiling fan cards (SK, Khurshid, Agha)" },
  { href: "/admin/models", title: "Fan Models", text: "Fan models, prices, images, colors" },
  { href: "/admin/converters", title: "Converters", text: "DC to AC converter card and models" },
  { href: "/admin/chargers", title: "Chargers", text: "Battery charger card and models" },
  { href: "/admin/solar", title: "Solar", text: "Solar controller card and models" },
];

const STATUS: Record<string, { l: string; cls: string }> = {
  new: { l: "New", cls: "bg-amber-500/20 text-amber-300" },
  confirmed: { l: "Confirmed", cls: "bg-blue-500/20 text-blue-300" },
  delivered: { l: "Delivered", cls: "bg-green-500/20 text-green-300" },
  cancelled: { l: "Cancelled", cls: "bg-red-500/20 text-red-300" },
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const list = orders ?? [];
  const today = new Date().toDateString();
  const fresh = list.filter((o) => o.status === "new").length;
  const todayCount = list.filter((o) => new Date(o.createdAt).toDateString() === today).length;
  const sales = list.filter((o) => o.status !== "cancelled").reduce((n, o) => n + o.total, 0);

  const stats = [
    { l: "New orders", v: orders ? String(fresh) : "...", hot: fresh > 0 },
    { l: "Today's orders", v: orders ? String(todayCount) : "..." },
    { l: "Total orders", v: orders ? String(list.length) : "..." },
    { l: "Total sales", v: orders ? money(sales) : "..." },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold">Dashboard</h1>
      <p className="mb-6 text-sm text-neutral-400">Manage the site's sections from here.</p>

      {/* counts */}
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.l}
            href="/admin/orders"
            className={`border p-4 ${
              s.hot ? "border-brand" : "border-neutral-800 hover:border-neutral-600"
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-neutral-400">{s.l}</p>
            <p className={`mt-2 text-2xl font-bold ${s.hot ? "text-brand" : ""}`}>{s.v}</p>
          </Link>
        ))}
      </div>

      {/* latest orders */}
      <div className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest orders</h2>
          <Link href="/admin/orders" className="text-sm text-brand">
            View all
          </Link>
        </div>

        {orders && list.length === 0 && (
          <p className="text-sm text-neutral-500">No orders yet.</p>
        )}

        <div className="space-y-2">
          {list.slice(0, 5).map((o) => {
            const st = STATUS[o.status] ?? STATUS.new;
            return (
              <Link
                key={o._id}
                href="/admin/orders"
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-neutral-800 p-3 hover:border-neutral-600"
              >
                <span className="font-semibold">{o.orderNo}</span>
                <span className={`px-2 py-0.5 text-xs ${st.cls}`}>{st.l}</span>
                <span className="text-sm text-neutral-300">{o.name}</span>
                <span className="text-sm text-neutral-500">{o.city}</span>
                <span className="ml-auto text-sm font-semibold text-brand">{money(o.total)}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* sections */}
      <h2 className="mb-3 text-lg font-semibold">Sections</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="block border border-neutral-700 px-6 py-5 hover:border-brand"
          >
            <p className="font-semibold">{t.title}</p>
            <p className="mt-1 text-sm text-neutral-400">{t.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}