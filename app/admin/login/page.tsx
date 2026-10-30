"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });

    if (res.ok) {
      router.replace("/admin");
      router.refresh();
    } else {
      setError((await res.json()).error ?? "Login fail");
      setLoading(false);
    }
  }

  const input =
    "mt-1 w-full border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-brand";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 text-white">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border border-neutral-800 p-8">
        <h1 className="text-center text-xl font-semibold uppercase tracking-widest">
          Admin Login
        </h1>

        <label className="block text-xs uppercase tracking-wider text-neutral-400">
          Username
          <input name="username" required autoComplete="username" className={input} />
        </label>

        <label className="block text-xs uppercase tracking-wider text-neutral-400">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={input}
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          disabled={loading}
          className="w-full bg-brand py-2.5 text-sm font-semibold uppercase tracking-widest text-black disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}