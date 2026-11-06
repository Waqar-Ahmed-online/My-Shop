"use client";

import { useEffect, useState } from "react";
import { FAN_TYPES, getFanType } from "@/lib/fanTypes";
type Card = { _id: string; label: string; href: string; group?: string };
type ColorRow = { _id: string; name: string; hex: string; hex2?: string; image: string };
type Row = {
  _id: string;
  image: string;
  name: string;
  price: number | null;
  oldPrice: number | null;
  category: string;
    fanType?: string;
  sizes: string[];
  inStock: boolean;
  colors: ColorRow[];
};
type Pending = {
  id: string;
  file: File;
  preview: string;
  name: string;
  hex: string;
  hex2: string; // khali = single color, bhara = two-tone
    nameEdited: boolean; // true = naam aap ne haath se likha
};

const empty = { category: "", fanType: "", name: "", price: "", oldPrice: "", sizes: "", inStock: "1" };

const input =
  "w-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-brand";

const smallBtn =
  "border border-neutral-600 px-2 py-1 text-xs text-white hover:border-neutral-400 disabled:opacity-50";

/* ---------- helpers ---------- */

const HEX = /^#[0-9a-fA-F]{6}$/;
const validHex = (h: string) => (HEX.test(h) ? h : "#cccccc");
/* ---------- rang se naam banana ---------- */

const COLOR_NAMES: [string, string][] = [
  ["White", "#f5f5f3"],
  ["Cream", "#eee6cf"],
  ["Beige", "#d9c9a5"],
  ["Silver", "#c3c5c8"],
  ["Grey", "#8b8e91"],
  ["Dark Grey", "#4d4f52"],
  ["Black", "#17171a"],
  ["Brown", "#6e4b33"],
  ["Dark Brown", "#3d2a1d"],
  ["Wood", "#b98a52"],
  ["Gold", "#c8a24e"],
  ["Yellow", "#e8c240"],
  ["Copper", "#b46a3c"],
  ["Bronze", "#8b6b3d"],
  ["Orange", "#dd8030"],
  ["Red", "#b3261e"],
  ["Maroon", "#6a1f2c"],
  ["Pink", "#d98aa7"],
  ["Blue", "#2160d6"],
  ["Navy", "#1b2a5c"],
  ["Green", "#2f7d52"],
];

function hexToLab(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = lin((n >> 16) & 255);
  const g = lin((n >> 8) & 255);
  const b = lin(n & 255);
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

const PALETTE = COLOR_NAMES.map(([name, hex]) => ({ name, lab: hexToLab(hex) }));

// sab se qareeb rang ka naam
function nearestColorName(hex: string): string {
  const lab = hexToLab(validHex(hex));
  let best = PALETTE[0];
  let bestD = Infinity;
  for (const p of PALETTE) {
    const d =
      (p.lab[0] - lab[0]) ** 2 + (p.lab[1] - lab[1]) ** 2 + (p.lab[2] - lab[2]) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best.name;
}

// single: "Gold"   two-tone: "Gold & Black"
function autoName(hex: string, hex2?: string): string {
  const a = nearestColorName(hex);
  if (!hex2 || !HEX.test(hex2)) return a;
  const b = nearestColorName(hex2);
  return a === b ? a : `${a} & ${b}`;
}
// single ya two-tone (diagonal) swatch ki style
const swatchStyle = (hex: string, hex2?: string): React.CSSProperties =>
  hex2 && HEX.test(hex2)
    ? { background: `linear-gradient(135deg, ${validHex(hex)} 50%, ${hex2} 50%)` }
    : { backgroundColor: validHex(hex) };

// "cream_K-78.png" -> "cream K-78"


// screen par kahin se bhi rang uthao (Chrome / Edge)
type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };
async function eyedrop(): Promise<string | null> {
  const ED = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
  if (!ED) {
    alert("Ye browser eyedropper support nahi karta. Chrome ya Edge use karo.");
    return null;
  }
  try {
    const r = await new ED().open();
    return r.sRGBHex;
  } catch {
    return null; // Esc dabaya
  }
}

// image se andaza (sirf shuruaati rang, asli rang eyedropper se lo)
async function pickColor(file: File): Promise<string> {
  try {
    const bmp = await createImageBitmap(file);
    const S = 48;
    const canvas = document.createElement("canvas");
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return "#cccccc";
    ctx.drawImage(bmp, 0, 0, S, S);
    const { data } = ctx.getImageData(0, 0, S, S);

    const scan = (limit: number) => {
      const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < 128) continue;
        if (r > limit && g > limit && b > limit) continue;
        total++;
        const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
        const cur = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
        cur.n++;
        cur.r += r;
        cur.g += g;
        cur.b += b;
        buckets.set(key, cur);
      }
      let best: { n: number; r: number; g: number; b: number } | null = null;
      for (const v of buckets.values()) if (!best || v.n > best.n) best = v;
      return { total, best };
    };

    let res = scan(235);
    if (res.total < 35) res = scan(252);
    if (!res.best || res.total < 35) return "#f5f5f5";

    const { n, r, g, b } = res.best;
    return (
      "#" +
      [r / n, g / n, b / n]
        .map((v) => Math.round(v).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return "#cccccc";
  }
}

function revokeAll(rows: Pending[]) {
  rows.forEach((r) => URL.revokeObjectURL(r.preview));
}

// colors ek ek karke upload (ek saath nahi, warna database save mein clash hota hai)
async function uploadColors(
  modelId: string,
  rows: Pending[],
  onProgress: (done: number) => void
) {
  const failed: Pending[] = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const fd = new FormData();
    fd.append("name", r.name.trim());
    fd.append("hex", validHex(r.hex));
    fd.append("hex2", HEX.test(r.hex2) ? r.hex2 : "");
    fd.append("image", r.file);
    try {
      const res = await fetch(`/api/admin/models/${modelId}/colors`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) failed.push(r);
    } catch {
      failed.push(r);
    }
    onProgress(i + 1);
  }
  return failed;
}

/* ---------- bulk colors picker ---------- */

function ColorQueue({
  rows,
  setRows,
  disabled,
}: {
  rows: Pending[];
  setRows: React.Dispatch<React.SetStateAction<Pending[]>>;
  disabled?: boolean;
}) {
  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const files = Array.from(el.files ?? []);
    el.value = ""; // dobara aur images bhi add ho saken
    if (files.length === 0) return;

       const added: Pending[] = await Promise.all(
      files.map(async (file) => {
        const hex = await pickColor(file);
        return {
          id: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
          name: autoName(hex),
          hex,
          hex2: "",
          nameEdited: false,
        };
      })
    );
    setRows((r) => [...r, ...added]);
  }

   function update(id: string, patch: Partial<Pending>) {
    setRows((r) =>
      r.map((x) => {
        if (x.id !== id) return x;
        const next = { ...x, ...patch };
        // rang badalne par naam khud badle (agar aap ne naam haath se na likha ho)
        if (!next.nameEdited && ("hex" in patch || "hex2" in patch)) {
          next.name = autoName(next.hex, next.hex2);
        }
        return next;
      })
    );
  }

  function remove(id: string) {
    const x = rows.find((r) => r.id === id);
    if (x) URL.revokeObjectURL(x.preview);
    setRows((r) => r.filter((y) => y.id !== id));
  }

  async function pick(id: string, key: "hex" | "hex2") {
    const c = await eyedrop();
    if (c) update(id, key === "hex" ? { hex: c } : { hex2: c });
  }

  const colorBox =
    "h-8 w-9 shrink-0 cursor-pointer border border-neutral-700 bg-neutral-900";

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={disabled}
        onChange={onFiles}
        className={input}
      />

      {rows.map((r) => (
        <div key={r.id} className="space-y-2 border border-neutral-800 p-2">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.preview} alt="" className="h-12 w-12 shrink-0 bg-white object-contain" />
            <input
              value={r.name}
                            onChange={(e) =>
                update(r.id, { name: e.target.value, nameEdited: e.target.value.trim() !== "" })
              }
              placeholder="Color ka naam"
              disabled={disabled}
              className={`${input} min-w-32 flex-1`}
            />
            <button
              type="button"
              onClick={() => remove(r.id)}
              disabled={disabled}
              className="px-1 text-sm text-red-500"
              aria-label="Hata do"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span
              className="h-8 w-8 shrink-0 border border-neutral-600"
              style={swatchStyle(r.hex, r.hex2)}
              title="Swatch preview"
            />
            <span>Color 1</span>
            <input
              type="color"
              value={validHex(r.hex)}
              onChange={(e) => update(r.id, { hex: e.target.value })}
              disabled={disabled}
              className={colorBox}
            />
            <button
              type="button"
              disabled={disabled}
              onClick={() => pick(r.id, "hex")}
              className={smallBtn}
            >
              Eyedropper
            </button>

            {r.hex2 ? (
              <>
                <span className="ml-2">Color 2</span>
                <input
                  type="color"
                  value={validHex(r.hex2)}
                  onChange={(e) => update(r.id, { hex2: e.target.value })}
                  disabled={disabled}
                  className={colorBox}
                />
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(r.id, "hex2")}
                  className={smallBtn}
                >
                  Eyedropper
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => update(r.id, { hex2: "" })}
                  className="text-red-500"
                >
                  2nd hata do
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={disabled}
                onClick={() => update(r.id, { hex2: validHex(r.hex) })}
                className={`${smallBtn} ml-2`}
              >
                + 2nd color (two-tone)
              </button>
            )}
          </div>
        </div>
      ))}

      {rows.length > 0 && (
        <p className="text-xs text-neutral-400">
          {rows.length} color(s) tayyar. Rang theek karne ke liye Eyedropper dabao aur screen se
          rang uthao (SK ki site ko side-by-side khol lo).
        </p>
      )}
    </div>
  );
}

/* ---------- existing model ke colors ---------- */

/* ---------- ek color ko edit karna ---------- */

function ColorEditor({
  modelId,
  color,
  onDone,
}: {
  modelId: string;
  color: ColorRow;
  onDone: (changed: boolean) => void;
}) {
  const [name, setName] = useState(color.name);
  const [hex, setHex] = useState(color.hex);
  const [hex2, setHex2] = useState(color.hex2 ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function pick(which: "hex" | "hex2") {
    const c = await eyedrop();
    if (!c) return;
    if (which === "hex") setHex(c);
    else setHex2(c);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Color ka naam likho");
      return;
    }
    setSaving(true);
    setError("");

    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("hex", validHex(hex));
    fd.append("hex2", HEX.test(hex2) ? hex2 : "");
    if (file) fd.append("image", file);

    const res = await fetch(`/api/admin/models/${modelId}/colors/${color._id}`, {
      method: "PUT",
      body: fd,
    });

    if (res.ok) {
      onDone(true);
    } else {
      setError((await res.json()).error ?? "Save nahi hua");
      setSaving(false);
    }
  }

  const colorBox =
    "h-8 w-9 shrink-0 cursor-pointer border border-neutral-700 bg-neutral-900";

  return (
    <form onSubmit={save} className="space-y-2 border border-brand p-2">
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={color.image} alt={color.name} className="h-12 w-12 shrink-0 bg-white object-contain" />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Color ka naam"
          disabled={saving}
          className={`${input} min-w-32 flex-1`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
        <span
          className="h-8 w-8 shrink-0 border border-neutral-600"
          style={swatchStyle(hex, hex2)}
          title="Swatch preview"
        />
        <span>Color 1</span>
        <input
          type="color"
          value={validHex(hex)}
          onChange={(e) => setHex(e.target.value)}
          disabled={saving}
          className={colorBox}
        />
        <button type="button" disabled={saving} onClick={() => pick("hex")} className={smallBtn}>
          Eyedropper
        </button>

        {hex2 ? (
          <>
            <span className="ml-2">Color 2</span>
            <input
              type="color"
              value={validHex(hex2)}
              onChange={(e) => setHex2(e.target.value)}
              disabled={saving}
              className={colorBox}
            />
            <button type="button" disabled={saving} onClick={() => pick("hex2")} className={smallBtn}>
              Eyedropper
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setHex2("")}
              className="text-red-500"
            >
              2nd hata do
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={() => setHex2(validHex(hex))}
            className={`${smallBtn} ml-2`}
          >
            + 2nd color (two-tone)
          </button>
        )}
      </div>

      <div>
        <input
          type="file"
          accept="image/*"
          disabled={saving}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={input}
        />
        <p className="mt-1 text-xs text-neutral-400">
          Image badalni ho tabhi choose karo, warna purani rahegi.
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          disabled={saving}
          className="bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Color"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onDone(false)}
          className="border border-neutral-600 px-4 py-2 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ---------- existing model ke colors ---------- */

function Colors({ model, onChange }: { model: Row; onChange: () => void }) {
  const [rows, setRows] = useState<Pending[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function addAll() {
    if (rows.length === 0) return;
    if (rows.some((r) => !r.name.trim())) {
      setError("Har color ka naam likho");
      return;
    }
    setLoading(true);
    setError("");

    const failed = await uploadColors(model._id, rows, (n) =>
      setProgress(`${n}/${rows.length}`)
    );

    const failedIds = new Set(failed.map((f) => f.id));
    revokeAll(rows.filter((r) => !failedIds.has(r.id)));
    setRows(failed);
    if (failed.length) {
      setError(`Ye colors upload nahi hue: ${failed.map((f) => f.name).join(", ")}. Dobara try karo.`);
    }
    setProgress("");
    setLoading(false);
    onChange();
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

      {model.colors.map((c) =>
        editingId === c._id ? (
          <ColorEditor
            key={c._id}
            modelId={model._id}
            color={c}
            onDone={(changed) => {
              setEditingId(null);
              if (changed) onChange();
            }}
          />
        ) : (
          <div key={c._id} className="flex items-center gap-3">
            <span
              className="h-6 w-6 rounded-full border border-neutral-600"
              style={swatchStyle(c.hex, c.hex2)}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt={c.name} className="h-12 w-12 bg-white object-contain" />
            <p className="flex-1 text-sm">{c.name}</p>
            <button onClick={() => setEditingId(c._id)} className="text-sm text-brand">
              Edit
            </button>
            <button onClick={() => del(c._id)} className="text-sm text-red-500">
              Delete
            </button>
          </div>
        )
      )}

      <div className="space-y-2">
        <p className="text-xs text-neutral-400">Naye colors add karo (ek ya bohat saari images ek saath):</p>
        <ColorQueue rows={rows} setRows={setRows} disabled={loading} />
        {rows.length > 0 && (
          <button
            type="button"
            onClick={addAll}
            disabled={loading}
            className="bg-brand px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? `Upload ho raha hai ${progress}` : `Add ${rows.length} Color(s)`}
          </button>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
/* ---------- main page ---------- */

export default function AdminModels() {
  const [cards, setCards] = useState<Card[]>([]);
  const [models, setModels] = useState<Row[]>([]);
  const [values, setValues] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [pending, setPending] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [c, m] = await Promise.all([
      fetch("/api/admin/cards"),
      fetch("/api/admin/models"),
    ]);
    // converter ke cards/models yahan nahi, wo "Converters" tab mein hain
    const allCards: Card[] = c.ok ? await c.json() : [];
    const convSlugs = new Set(
            allCards.filter((x) => x.group && x.group !== "fan").map((x) => x.href.replace(/^\//, ""))
    );
        setCards(allCards.filter((x) => !x.group || x.group === "fan"));
    if (m.ok) {
      const data: Row[] = await m.json();
      setModels(
        data
          .filter((x) => !convSlugs.has(x.category))
          .map((x) => ({ ...x, colors: x.colors ?? [], sizes: x.sizes ?? [] }))
      );
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
            fanType: m.fanType ?? "",
      name: m.name,
      price: m.price?.toString() ?? "",
      oldPrice: m.oldPrice?.toString() ?? "",
      sizes: (m.sizes ?? []).join(", "),
      inStock: m.inStock === false ? "0" : "1",
    });
    revokeAll(pending);
    setPending([]);
    setFileKey((k) => k + 1);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
       setValues((v) => ({ ...empty, category: v.category, fanType: v.fanType }));
    setFileKey((k) => k + 1);
    setError("");
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!editingId && pending.some((r) => !r.name.trim())) {
      setError("Har color ka naam likho");
      return;
    }

    setLoading(true);

    const res = await fetch(
      editingId ? `/api/admin/models/${editingId}` : "/api/admin/models",
      { method: editingId ? "PUT" : "POST", body: new FormData(e.currentTarget) }
    );

    if (!res.ok) {
      setError((await res.json()).error ?? "Save nahi hua");
      setLoading(false);
      return;
    }

    let failedNames: string[] = [];
    if (!editingId && pending.length > 0) {
      const created = await res.json();
      const failed = await uploadColors(created._id, pending, (n) =>
        setProgress(`Colors: ${n}/${pending.length}`)
      );
      failedNames = failed.map((f) => f.name);
    }

    revokeAll(pending);
    setPending([]);
    setProgress("");
    reset();
    await load();
    if (failedNames.length) {
      setError(
        `Model add ho gaya, lekin ye colors upload nahi hue: ${failedNames.join(", ")}. Model ki row se dobara add karo.`
      );
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

        <select name="fanType" value={values.fanType} onChange={change} className={input}>
          <option value="">Auto (naam se pehchane)</option>
          {FAN_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
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
              : "Ye main image hai (list me dikhegi)."}
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

        {!editingId && (
          <div className="space-y-2 border border-dashed border-neutral-700 p-3">
            <p className="text-xs text-neutral-400">
              Colors (optional): sab colors ki images ek saath select karo. Naam file ke naam se
              aata hai, rang Eyedropper se uthao, aur two-tone ke liye &quot;+ 2nd color&quot; dabao.
            </p>
            <ColorQueue rows={pending} setRows={setPending} disabled={loading} />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={loading}
            className="bg-brand px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading
              ? progress || "Saving..."
              : editingId
                ? "Update Model"
                : pending.length > 0
                  ? `Add Model + ${pending.length} Color(s)`
                  : "Add Model"}
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
                                <p className="text-xs uppercase text-neutral-400">
                  {labelOf(m.category)}
                  {` · ${FAN_TYPES.find((t) => t.value === getFanType(m))?.label ?? ""}`}
                </p>
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