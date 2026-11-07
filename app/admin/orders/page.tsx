"use client";

import { useEffect, useState } from "react";

type Item = {
  modelId: string;
  name: string;
  image: string;
  color?: string;
  size?: string;
  qty: number;
  price: number;
};

type Order = {
  _id: string;
  orderNo: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  note?: string;
  items: Item[];
  total: number;
  status: string;
  createdAt: string;
};

const STATUSES = [
  { v: "new", l: "New", cls: "bg-amber-500/20 text-amber-300" },
  { v: "confirmed", l: "Confirmed", cls: "bg-blue-500/20 text-blue-300" },
  { v: "delivered", l: "Delivered", cls: "bg-green-500/20 text-green-300" },
  { v: "cancelled", l: "Cancelled", cls: "bg-red-500/20 text-red-300" },
];

const money = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;

// 0300... -> 92300...
function waPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.startsWith("92")) return d;
  if (d.startsWith("0")) return "92" + d.slice(1);
  return "92" + d;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoaded(true);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) setOrders((p) => p.map((o) => (o._id === id ? { ...o, status } : o)));
  }

  async function remove(id: string) {
    if (!confirm("Do you want to delete this order?")) return;
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setOrders((p) => p.filter((o) => o._id !== id));
  }

  const count = (s: string) => orders.filter((o) => o.status === s).length;
  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold">Orders</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Orders received from the website. For new orders, confirm with the customer on WhatsApp,
        then update the status.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {[{ v: "all", l: "All" }, ...STATUSES].map((s) => (
          <button
            key={s.v}
            type="button"
            onClick={() => setFilter(s.v)}
            className={`border px-4 py-1.5 text-xs uppercase tracking-wider ${
              filter === s.v
                ? "border-brand text-brand"
                : "border-neutral-700 hover:border-neutral-500"
            }`}
          >
            {s.l} ({s.v === "all" ? orders.length : count(s.v)})
          </button>
        ))}
      </div>

      {!loaded && <p className="text-sm text-neutral-500">Loading...</p>}
      {loaded && list.length === 0 && (
        <p className="text-sm text-neutral-500">No orders yet.</p>
      )}

      <div className="space-y-3">
        {list.map((o) => {
          const st = STATUSES.find((s) => s.v === o.status) ?? STATUSES[0];
          const open = openId === o._id;
          const msg = `Assalam o Alaikum ${o.name}! This is Abrar Khan Electronics. We have received your order ${o.orderNo} (${money(o.total)}).`;

          return (
            <div key={o._id} className="border border-neutral-800">
              {/* top bar */}
              <button
                type="button"
                onClick={() => setOpenId(open ? null : o._id)}
                className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left hover:bg-neutral-900"
              >
                <span className="font-semibold">{o.orderNo}</span>
                <span className={`px-2 py-0.5 text-xs ${st.cls}`}>{st.l}</span>
                <span className="text-sm text-neutral-300">{o.name}</span>
                <span className="text-sm text-neutral-500">{o.city}</span>
                <span className="ml-auto text-sm font-semibold text-brand">{money(o.total)}</span>
                <span className="w-full text-xs text-neutral-500 sm:w-auto">
                  {new Date(o.createdAt).toLocaleString("en-PK", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </button>

              {open && (
                <div className="space-y-5 border-t border-neutral-800 p-4">
                  {/* customer */}
                  <div className="grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-500">Customer</p>
                      <p className="mt-1 font-medium">{o.name}</p>
                      <a href={`tel:${o.phone}`} className="text-brand">
                        {o.phone}
                      </a>
                      {o.email && (
                        <a href={`mailto:${o.email}`} className="block text-neutral-300 hover:text-brand">
                          {o.email}
                        </a>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-neutral-500">Address</p>
                      <p className="mt-1">{o.city}</p>
                      <p className="text-neutral-300">{o.address}</p>
                    </div>
                  </div>

                  {o.note && (
                    <div className="text-sm">
                      <p className="text-xs uppercase tracking-wider text-neutral-500">Note</p>
                      <p className="mt-1 text-neutral-300">{o.note}</p>
                    </div>
                  )}

                  {/* items */}
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-neutral-500">Items</p>
                    <ul className="space-y-2">
                      {o.items.map((it, n) => (
                        <li key={n} className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={it.image}
                            alt={it.name}
                            className="h-14 w-14 shrink-0 border border-neutral-700 object-cover"
                          />
                          <div className="min-w-0 flex-1 text-sm">
                            <p className="truncate font-medium">{it.name}</p>
                            <p className="text-xs text-neutral-500">
                              {[it.color, it.size && `Size ${it.size}`]
                                .filter(Boolean)
                                .join(" · ")}
                              {(it.color || it.size) && " · "}
                              {money(it.price)} x {it.qty}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-semibold">{money(it.price * it.qty)}</p>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-right text-sm">
                      Total: <span className="font-bold text-brand">{money(o.total)}</span>
                    </p>
                  </div>

                  {/* actions */}
                  <div className="flex flex-wrap items-center gap-3 border-t border-neutral-800 pt-4">
                    <select
                      value={o.status}
                      onChange={(e) => setStatus(o._id, e.target.value)}
                      className="border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-brand"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.v} value={s.v}>
                          {s.l}
                        </option>
                      ))}
                    </select>

                    <a
                      href={`https://wa.me/${waPhone(o.phone)}?text=${encodeURIComponent(msg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      WhatsApp customer
                    </a>

                    <button
                      type="button"
                      onClick={() => remove(o._id)}
                      className="ml-auto text-sm text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}