"use client";

import { useEffect, useState } from "react";

type Group = "converter" | "charger";

type Cfg = {
  group: Group;
  pageTitle: string; // "DC to AC Converters"
  noun: string; // "Converter"
  defaultLabel: string;
  defaultHref: string;
  nameExample: string;
  nameHint: string;
};

type Card = { _id: string; label: string; href: string; image: string; group?: string };
type Model = {
  _id: string;
  image: string;
  name: string;
  price: number | null;
  oldPrice: number | null;
  category: string;
  inStock: boolean;
};

const slugOf = (href: string) => href.replace(/^\//, "");

// link hamesha / se shuru, chhote harf, dash se jora hua
const normalizeHref = (v: string) => {
  let s = v.toLowerCase().replace(/[^a-z0-9/-]/g, "-");
  if (!s.startsWith("/")) s = "/" + s;
  return s.replace(/\/{2,}/g, "/");
};

const input =
  "w-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-brand";

/* ---------------- 1) Card ---------------- */

function CardSection({
  cfg,
  cards,
  models,
  onChange,
}: {
  cfg: Cfg;
  cards: Card[];
  models: Model[];
  onChange: () => void;
}) {
  const emptyCard = { label: cfg.defaultLabel, href: cfg.defaultHref };
  const [values, setValues] = useState(emptyCard);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: name === "href" ? normalizeHref(value) : value }));
  }

  function startEdit(c: Card) {
    setEditingId(c._id);
    setValues({ label: c.label, href: c.href });
    setFileKey((k) => k + 1);
    setError("");
  }

  function reset() {
    setEditingId(null);
    setValues(emptyCard);
    setFileKey((k) => k + 1);
    setError("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(
      editingId ? `/api/admin/cards/${editingId}` : "/api/admin/cards",
      { method: editingId ? "PUT" : "POST", body: new FormData(e.currentTarget) }
    );

    if (res.ok) {
      reset();
      onChange();
    } else {
      setError((await res.json()).error ?? "Save nahi hua");
    }
    setLoading(false);
  }

  async function remove(c: Card) {
    if (models.some((m) => m.category === slugOf(c.href))) {
      alert("Pehle is card ke models delete karo (neeche Models wale hissay mein).");
      return;
    }
    if (!confirm("Ye card delete karna hai?")) return;
    await fetch(`/api/admin/cards/${c._id}`, { method: "DELETE" });
    onChange();
  }

  return (
    <section className="mb-12">
      <h2 className="mb-1 text-xl font-bold">1. {cfg.noun} card</h2>
      <p className="mb-4 text-sm text-neutral-400">
        Ye card home page par &quot;Collection&quot; section mein dikhta hai. Isay dabane par{" "}
        {cfg.noun.toLowerCase()} ka page khulta hai.
      </p>

      <form onSubmit={onSubmit} className="mb-5 space-y-3 border border-neutral-800 p-4">
        <p className="text-sm font-semibold text-brand">
          {editingId ? "Card edit karo" : `Naya ${cfg.noun.toLowerCase()} card`}
        </p>

        <input type="hidden" name="group" value={cfg.group} />

        <div>
          <input
            key={fileKey}
            type="file"
            name="image"
            accept="image/*"
            required={!editingId}
            className={input}
          />
          <p className="mt-1 text-xs text-neutral-400">
            {editingId
              ? "Image badalni ho tabhi choose karo, warna purani rahegi."
              : "Lambi (portrait) image use karo, jaise 1200 x 1600."}
          </p>
        </div>

        <input
          name="label"
          value={values.label}
          onChange={change}
          placeholder={`Label (e.g. ${cfg.defaultLabel})`}
          required
          className={input}
        />

        <div>
          <input
            name="href"
            value={values.href}
            onChange={change}
            readOnly={!!editingId}
            placeholder={`Link (e.g. ${cfg.defaultHref})`}
            className={`${input} ${editingId ? "opacity-60" : ""}`}
          />
          <p className="mt-1 text-xs text-neutral-400">
            {editingId
              ? "Link badal nahi sakte (models isi se jure hain)."
              : "Ye link khud theek ho jata hai, isay aise hi rehne do."}
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={loading}
            className="bg-brand px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Card" : "Add Card"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="border border-neutral-600 px-5 py-2 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {cards.map((c) => (
          <div
            key={c._id}
            className={`flex items-center gap-4 border p-3 ${
              editingId === c._id ? "border-brand" : "border-neutral-800"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.label} className="h-20 w-16 object-cover" />
            <div className="flex-1">
              <p className="font-semibold">{c.label}</p>
              <p className="text-xs text-neutral-400">
                {c.href} · {models.filter((m) => m.category === slugOf(c.href)).length} models
              </p>
            </div>
            <button onClick={() => startEdit(c)} className="text-sm text-brand">
              Edit
            </button>
            <button onClick={() => remove(c)} className="text-sm text-red-500">
              Delete
            </button>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-sm text-neutral-500">
            Abhi koi {cfg.noun.toLowerCase()} card nahi hai.
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------------- 2) Models ---------------- */

const emptyModel = { category: "", name: "", price: "", oldPrice: "", inStock: "1" };

function ModelSection({
  cfg,
  cards,
  models,
  onChange,
}: {
  cfg: Cfg;
  cards: Card[];
  models: Model[];
  onChange: () => void;
}) {
  const [values, setValues] = useState(emptyModel);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slugs = cards.map((c) => slugOf(c.href));
  // sirf 1 card ho to khud chun lo
  const category = values.category || (slugs.length === 1 ? slugs[0] : "");
  const labelOf = (slug: string) =>
    cards.find((c) => slugOf(c.href) === slug)?.label ?? slug;

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  function startEdit(m: Model) {
    setEditingId(m._id);
    setValues({
      category: m.category,
      name: m.name,
      price: m.price?.toString() ?? "",
      oldPrice: m.oldPrice?.toString() ?? "",
      inStock: m.inStock === false ? "0" : "1",
    });
    setFileKey((k) => k + 1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setValues((v) => ({ ...emptyModel, category: v.category }));
    setFileKey((k) => k + 1);
    setError("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(
      editingId ? `/api/admin/models/${editingId}` : "/api/admin/models",
      { method: editingId ? "PUT" : "POST", body: new FormData(e.currentTarget) }
    );

    if (res.ok) {
      reset();
      onChange();
    } else {
      setError((await res.json()).error ?? "Save nahi hua");
    }
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Ye model delete karna hai?")) return;
    await fetch(`/api/admin/models/${id}`, { method: "DELETE" });
    if (editingId === id) reset();
    onChange();
  }

  if (cards.length === 0) {
    return (
      <section>
        <h2 className="mb-1 text-xl font-bold">2. {cfg.noun} models</h2>
        <p className="text-sm text-neutral-500">
          Pehle upar {cfg.noun.toLowerCase()} card banao, phir yahan models add kar sakoge.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-1 text-xl font-bold">2. {cfg.noun} models</h2>
      <p className="mb-4 text-sm text-neutral-400">{cfg.nameHint}</p>

      <form onSubmit={onSubmit} className="mb-5 space-y-3 border border-neutral-800 p-4">
        <p className="text-sm font-semibold text-brand">
          {editingId ? "Model edit karo" : "Naya model add karo"}
        </p>

        <select
          name="category"
          value={category}
          onChange={change}
          required
          className={input}
        >
          <option value="">Card chuno</option>
          {cards.map((c) => (
            <option key={c._id} value={slugOf(c.href)}>
              {c.label}
            </option>
          ))}
        </select>

        <div>
          <input
            key={fileKey}
            type="file"
            name="image"
            accept="image/*"
            required={!editingId}
            className={input}
          />
          <p className="mt-1 text-xs text-neutral-400">
            {editingId
              ? "Image badalni ho tabhi choose karo, warna purani rahegi."
              : "Ye main image hai (list mein dikhegi)."}
          </p>
        </div>

        <input
          name="name"
          value={values.name}
          onChange={change}
          placeholder={`Model ka naam (e.g. ${cfg.nameExample})`}
          required
          className={input}
        />

        <div className="flex gap-3">
          <input
            name="oldPrice"
            type="number"
            min="0"
            value={values.oldPrice}
            onChange={change}
            placeholder="Purani price (kati hui)"
            className={input}
          />
          <input
            name="price"
            type="number"
            min="0"
            value={values.price}
            onChange={change}
            placeholder="Asli price"
            className={input}
          />
        </div>

        <select name="inStock" value={values.inStock} onChange={change} className={input}>
          <option value="1">In stock</option>
          <option value="0">Out of stock</option>
        </select>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={loading}
            className="bg-brand px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Model" : "Add Model"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="border border-neutral-600 px-5 py-2 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {models.map((m) => (
          <div
            key={m._id}
            className={`flex items-center gap-4 border p-3 ${
              editingId === m._id ? "border-brand" : "border-neutral-800"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.image} alt={m.name} className="h-16 w-16 bg-white object-contain" />
            <div className="flex-1">
              <p className="text-xs uppercase text-neutral-400">{labelOf(m.category)}</p>
              <p className="font-semibold">{m.name}</p>
              <p className="text-sm text-neutral-400">
                {m.oldPrice != null && (
                  <span className="mr-2 line-through">Rs. {m.oldPrice}</span>
                )}
                {m.price != null && <span>Rs. {m.price}</span>}
              </p>
            </div>
            <button onClick={() => startEdit(m)} className="text-sm text-brand">
              Edit
            </button>
            <button onClick={() => remove(m._id)} className="text-sm text-red-500">
              Delete
            </button>
          </div>
        ))}
        {models.length === 0 && (
          <p className="text-sm text-neutral-500">
            Abhi koi {cfg.noun.toLowerCase()} model nahi hai.
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------------- page ---------------- */

export default function ProductGroupAdmin(cfg: Cfg) {
  const [cards, setCards] = useState<Card[]>([]);
  const [models, setModels] = useState<Model[]>([]);

  async function load() {
    const [c, m] = await Promise.all([
      fetch("/api/admin/cards"),
      fetch("/api/admin/models"),
    ]);
    const all: Card[] = c.ok ? await c.json() : [];
    const mine = all.filter((x) => x.group === cfg.group);
    setCards(mine);

    if (m.ok) {
      const slugs = new Set(mine.map((x) => slugOf(x.href)));
      const data: Model[] = await m.json();
      setModels(data.filter((x) => slugs.has(x.category)));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg.group]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">{cfg.pageTitle}</h1>
      <CardSection cfg={cfg} cards={cards} models={models} onChange={load} />
      <ModelSection cfg={cfg} cards={cards} models={models} onChange={load} />
    </div>
  );
}