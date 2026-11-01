"use client";

import { useEffect, useState } from "react";

type Row = {
  _id: string;
  image: string;
  mobileImage?: string;
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
  const [fileKey, setFileKey] = useState(0); // file inputs reset karne ke liye
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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
    setNotice("");
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
    setNotice("");

    const fd = new FormData(e.currentTarget);
    const m = fd.get("mobileImage");
    const sentMobile = m instanceof File && m.size > 0;

    const res = await fetch(
      editingId ? `/api/admin/slides/${editingId}` : "/api/admin/slides",
      { method: editingId ? "PUT" : "POST", body: fd }
    );

    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Save nahi hua");
      setLoading(false);
      return;
    }

    const data = (await res.json().catch(() => ({}))) as { mobileImage?: string };
    await load();

    // mobile image bheji thi lekin database mein save nahi hui
    if (sentMobile && !data.mobileImage) {
      setError(
        "Slide save hui, lekin mobile image database mein save nahi hui. Dev server band karo (Ctrl + C), dobara npm run dev chalao, phir Edit se mobile image dobara upload karo."
      );
      setLoading(false);
      return;
    }

    setNotice(
      sentMobile
        ? "Save ho gayi ✓ Laptop aur mobile dono image upload hain."
        : "Slide save ho gayi ✓"
    );
    reset();
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
  const label = "mb-1 block text-xs text-neutral-400";

  const editingMobile = slides.find((s) => s._id === editingId)?.mobileImage;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Hero Slides</h1>

      {notice && (
        <p className="mb-4 border border-green-700 bg-green-950/40 px-3 py-2 text-sm text-green-400">
          {notice}
        </p>
      )}

      <form onSubmit={onSubmit} className="mb-8 space-y-3 border border-neutral-800 p-4">
        <p className="text-sm font-semibold text-brand">
          {editingId ? "Slide edit karo" : "Nayi slide add karo"}
        </p>

        <div>
          <label className={label}>Laptop / Desktop image (1920 × 1080, chaori)</label>
          <input
            key={`d${fileKey}`}
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

        <div>
          <label className={label}>Mobile image (1080 × 1920, lambi) — optional</label>
          <input
            key={`m${fileKey}`}
            type="file"
            name="mobileImage"
            accept="image/*"
            className={input}
          />
          <p className="mt-1 text-xs text-neutral-400">
            Na do to mobile par bhi laptop wali image hi dikhegi.
          </p>
          {editingId && editingMobile && (
            <label
              key={`r${fileKey}`}
              className="mt-2 flex items-center gap-2 text-xs text-neutral-300"
            >
              <input type="checkbox" name="removeMobile" value="1" />
              Mobile image hata do (laptop wali hi chalegi)
            </label>
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
            <div className="flex shrink-0 items-end gap-2">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.title} className="h-16 w-28 object-cover" />
                <p className="mt-1 text-[10px] uppercase text-neutral-500">Laptop</p>
              </div>
              <div>
                {s.mobileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.mobileImage} alt={`${s.title} mobile`} className="h-16 w-9 object-cover" />
                ) : (
                  <div className="flex h-16 w-9 items-center justify-center border border-dashed border-neutral-700 text-[9px] text-neutral-500">
                    nahi
                  </div>
                )}
                <p className="mt-1 text-[10px] uppercase text-neutral-500">Mobile</p>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs uppercase text-neutral-400">{s.eyebrow}</p>
              <p className="font-semibold">{s.title}</p>
              {s.mobileImage ? (
                <p className="mt-1 text-xs text-green-400">✓ Mobile image upload hai</p>
              ) : (
                <p className="mt-1 text-xs text-amber-400">
                  Mobile image nahi hai (mobile par laptop wali chalegi)
                </p>
              )}
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