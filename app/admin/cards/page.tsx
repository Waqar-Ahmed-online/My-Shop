"use client";

import { useEffect, useState } from "react";

type Row = { _id: string; image: string; label: string; href: string; group?: string };

const MAX = 3;

const empty = { label: "", href: "" };

export default function AdminCards() {
  const [cards, setCards] = useState<Row[]>([]);
  const [values, setValues] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/cards");
    if (res.ok) {
      const all: Row[] = await res.json();
      // converter ke cards yahan nahi, wo "Converters" tab mein hain
           setCards(all.filter((c) => !c.group || c.group === "fan"));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  function startEdit(c: Row) {
    setEditingId(c._id);
    setValues({ label: c.label, href: c.href === "#" ? "" : c.href });
    setFileKey((k) => k + 1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setValues(empty);
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
      await load();
    } else {
      setError((await res.json()).error ?? "Failed to save.");
    }
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this card?")) return;
    await fetch(`/api/admin/cards/${id}`, { method: "DELETE" });
    if (editingId === id) reset();
    await load();
  }

  const input =
    "w-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-brand";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold">Ceiling Fan Cards</h1>
      <p className="mb-6 text-sm text-neutral-400">
        Cards for the &quot;Ceiling Fan&quot; on the homepage (SK, Khurshid, Agha). You can add up to{" "}
        {MAX} cards.Converter cards are available in a separate (Converters) tab.
      </p>

      <form onSubmit={onSubmit} className="mb-8 space-y-3 border border-neutral-800 p-4">
        <p className="text-sm font-semibold text-brand">
          {editingId ? "Edit Card / Add New Card" : "Naya card add karo"}
        </p>

        {/* ye page hamesha pankhon ke liye hai */}
        <input type="hidden" name="group" value="fan" />

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
              ? "Only select a new image if you want to replace the existing one; otherwise, the previous image will remain./"
              : "Use a tall ( portrait ) image, such as 1200 × 1600."}
          </p>
        </div>

        <input
          name="label"
          value={values.label}
          onChange={change}
          placeholder="Label (e.g. SK Fan)"
          required
          className={input}
        />
        <div>
          <input
            name="href"
            value={values.href}
            onChange={change}
            placeholder="Link (e.g. /sk-fan-categories)"
            className={input}
          />
          <p className="mt-1 text-xs text-neutral-400">
           Start the link with / and use lowercase letters separated by hyphens (e.g., /sk-fan-categories). When adding models, you must select this card as the category.
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

      <p className="mb-2 text-sm font-semibold text-neutral-300">
        Ceiling Fan cards ({cards.length}/{MAX})
      </p>
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
              <p className="text-xs text-neutral-400">{c.href}</p>
            </div>
            <button onClick={() => startEdit(c)} className="text-sm text-brand">
              Edit
            </button>
            <button onClick={() => remove(c._id)} className="text-sm text-red-500">
              Delete
            </button>
          </div>
        ))}
        {cards.length === 0 && (
          <p className="text-sm text-neutral-500">	No cards available yet.</p>
        )}
      </div>
    </div>
  );
}