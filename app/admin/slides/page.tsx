"use client";

import { useEffect, useState } from "react";

type Row = {
  _id: string;
  image: string;
  title: string;
  eyebrow: string;
  primaryBtn: string;
  secondaryBtn: string;
};

const empty = { eyebrow: "", title: "", primaryBtn: "", secondaryBtn: "" };

export default function AdminSlides() {
  const [slides, setSlides] = useState<Row[]>([]);
  const [values, setValues] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0); // file input reset karne ke liye
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/slides");
    if (res.ok) setSlides(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  function change(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  function startEdit(s: Row) {
    setEditingId(s._id);
    setValues({
      eyebrow: s.eyebrow,
      title: s.title,
      primaryBtn: s.primaryBtn,
      secondaryBtn: s.secondaryBtn,
    });
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
      editingId ? `/api/admin/slides/${editingId}` : "/api/admin/slides",
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
    if (!confirm("Ye slide delete karni hai?")) return;
    await fetch(`/api/admin/slides/${id}`, { method: "DELETE" });
    if (editingId === id) reset();
    await load();
  }

  const input =
    "w-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-brand";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Hero Slides</h1>

      <form onSubmit={onSubmit} className="mb-8 space-y-3 border border-neutral-800 p-4">
        <p className="text-sm font-semibold text-brand">
          {editingId ? "Slide edit karo" : "Nayi slide add karo"}
        </p>

        <div>
          <input
            key={fileKey}
            type="file"
            name="image"
            accept="image/*"
            required={!editingId}
            className={input}
          />
          {editingId && (
            <p className="mt-1 text-xs text-neutral-400">
              Image badalni ho tabhi choose karo, warna purani rahegi.
            </p>
          )}
        </div>

        <input
          name="eyebrow"
          value={values.eyebrow}
          onChange={change}
          placeholder="Eyebrow (e.g. Summer Sale)"
          className={input}
        />
        <input
          name="title"
          value={values.title}
          onChange={change}
          placeholder="Title"
          required
          className={input}
        />
        <div className="flex gap-3">
          <input
            name="primaryBtn"
            value={values.primaryBtn}
            onChange={change}
            placeholder="Primary button"
            className={input}
          />
          <input
            name="secondaryBtn"
            value={values.secondaryBtn}
            onChange={change}
            placeholder="Secondary button"
            className={input}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={loading}
            className="bg-brand px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? "Saving..." : editingId ? "Update Slide" : "Add Slide"}
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
        {slides.map((s) => (
          <div
            key={s._id}
            className={`flex items-center gap-4 border p-3 ${
              editingId === s._id ? "border-brand" : "border-neutral-800"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt={s.title} className="h-16 w-28 object-cover" />
            <div className="flex-1">
              <p className="text-xs uppercase text-neutral-400">{s.eyebrow}</p>
              <p className="font-semibold">{s.title}</p>
            </div>
            <button onClick={() => startEdit(s)} className="text-sm text-brand">
              Edit
            </button>
            <button onClick={() => remove(s._id)} className="text-sm text-red-500">
              Delete
            </button>
          </div>
        ))}
        {slides.length === 0 && (
          <p className="text-sm text-neutral-400">Abhi koi slide nahi hai.</p>
        )}
      </div>
    </div>
  );
}