"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

// Naya section banana ho to bas yahan ek line add karo
const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/slides", label: "Hero" },
  { href: "/admin/cards", label: "Ceiling Fan" },
  { href: "/admin/models", label: "Fan Models" },
  { href: "/admin/converters", label: "Converters" },
];
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="flex items-center justify-between px-6 pt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          Abrar Electronics Admin
        </p>
        <button
          onClick={logout}
          className="border border-white/70 px-3 py-1 text-xs uppercase tracking-widest hover:bg-white hover:text-black"
        >
          Logout
        </button>
      </div>

      <nav className="grid grid-cols-2 gap-3 border-b border-neutral-800 p-6 md:grid-cols-5">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`border px-4 py-4 text-center text-sm font-medium uppercase tracking-wider ${
                active
                  ? "border-brand text-brand"
                  : "border-neutral-700 hover:border-neutral-500"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <main className="p-6">{children}</main>
    </div>
  );
}