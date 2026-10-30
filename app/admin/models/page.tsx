"use client";

import { useEffect, useState } from "react";

type Card = { _id: string; label: string; href: string };
type ColorRow = { _id: string; name: string; hex: string; image: string };
type Row = {
  _id: string;
  image: string;
  name: string;
  price: number | null;
  oldPrice: number | null;
  category: string;
    sizes: string[];
  inStock: boolean;
  colors: ColorRow[];
};

const empty = { category: "", name: "", price: "", oldPrice: "", sizes: "", inStock: "1" };

const input =
  "w-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-brand";

function Colors({ model, onChange }: { model: Row; onChange: () => void }) {
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#cccccc");
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/admin/models/${model._id}/colors`, {
      method: "POST",
      body: new FormData(e.currentTarget),
    });

    if (res.ok) {
      setName("");
      setFileKey((k) => k + 1);
      onChange();
    } else {
      setError((await res.json()).error ?? "Color add nahi hua");
    }
    setLoading(false);
  }

  async function del(colorId: string) {
    if (!confirm("Ye color delete karna hai?")) return;
    await fetch(`/api/admin/models/${model._id}/colors/${colorId}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="mt-3 space-y-3 border-t border-neutral-800 pt-3">
      <p className="text-xs uppercase tracking-wider text-neutral-400">
        Colors ({model.colors.length})
      </p>

      {model.colors.map((c) => (
        <div key={c._id} className="flex items-center gap-3">
          <span
            className="h-6 w-6 rounded-full border border-neutral-600"
            style={{ backgroundColor: c.hex }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.image} alt={c.name} className="h-12 w-12 bg-white object-contain" />
          <p className="flex-1 text-sm">{c.name}</p>
          <button onClick={() => del(c._id)} className="text-sm text-red-500">
            Delete
          </button>
        </div>
      ))}

      <form onSubmit={add} className="flex flex-wrap items-center gap-2">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Color ka naam (e.g. Ivory)"
          required
          className={`${input} sm:w-44`}
        />
               <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(hex) ? hex : "#cccccc"}
          onChange={(e) => setHex(e.target.value)}
          className="h-9 w-12 cursor-pointer border border-neutral-700 bg-neutral-900"
          title="Color ka rang chuno"
        />
        <input
          name="hex"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          placeholder="#F8EFE2"
          maxLength={7}
          className={`${input} sm:w-28`}
        />
        <input
          key={fileKey}
          type="file"
          name="image"
          accept="image/*"
          required
          className={`${input} flex-1`}
        />
        <button
          disabled={loading}
          className="bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {loading ? "..." : "Add Color"}
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function AdminModels() {
  const [cards, setCards] = useState<Card[]>([]);
  const [models, setModels] = useState<Row[]>([]);
  const [values, setValues] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 async function load() {
  const [c, m] = await Promise.all([
    fetch("/api/admin/cards"),
    fetch("/api/admin/models"),
  ]);
  if (c.ok) setCards(await c.json());
  if (m.ok) {
    const data: Row[] = await m.json();
        setModels(data.map((x) => ({ ...x, colors: x.colors ?? [], sizes: x.sizes ?? [] })));
  }
}

  useEffect(() => {
    load();
  }, []);

  const options = cards
    .filter((c) => c.href && c.href !== "#")
    .map((c) => ({ slug: c.href.replace(/^\//, ""), label: c.label }));

  const labelOf = (slug: string) => options.find((o) => o.slug === slug)?.label ?? slug;

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  function startEdit(m: Row) {
    setEditingId(m._id);
    setValues({
      category: m.category,
      name: m.name,
      price: m.price?.toString() ?? "",
      oldPrice: m.oldPrice?.toString() ?? "",
            sizes: (m.sizes ?? []).join(", "),
      inStock: m.inStock === false ? "0" : "1",
    });
    setFileKey((k) => k + 1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setValues((v) => ({ ...empty, category: v.category }));
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
      await load();
    } else {
      setError((await res.json()).error ?? "Save nahi hua");
    }
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Ye model (aur uske sab colors) delete karne hain?")) return;
    await fetch(`/api/admin/models/${id}`, { method: "DELETE" });
    if (editingId === id) reset();
    await load();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Fan Models</h1>

      <form onSubmit={onSubmit} className="mb-8 space-y-3 border border-neutral-800 p-4">
        <p className="text-sm font-semibold text-brand">
          {editingId ? "Model edit karo" : "Naya model add karo"}
        </p>

        <select
          name="category"
          value={values.category}
          onChange={change}
          required
          className={input}
        >
          <option value="">Category chuno (SK, Khurshid...)</option>
          {options.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.label}
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
              : "Ye main image hai (list me dikhegi). Colors baad me model ki row se add karo."}
          </p>
        </div>

        <input
          name="name"
          value={values.name}
          onChange={change}
          placeholder="Model ka naam (e.g. Super Deluxe)"
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
                <div className="flex gap-3">
          <input
            name="sizes"
            value={values.sizes}
            onChange={change}
            placeholder="Sizes (comma se, e.g. 48, 56)"
            className={input}
          />
          <select name="inStock" value={values.inStock} onChange={change} className={input}>
            <option value="1">In stock</option>
            <option value="0">Out of stock</option>
          </select>
        </div>

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
  className={`border p-3 ${
    editingId === m._id ? "border-brand" : "border-neutral-800"
  }`}
>
  <div className="flex items-center gap-4">
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

  <Colors model={m} onChange={load} />
</div>
        ))}
        {models.length === 0 && (
          <p className="text-sm text-neutral-400">Abhi koi model nahi hai.</p>
        )}
      </div>
    </div>
  );
}