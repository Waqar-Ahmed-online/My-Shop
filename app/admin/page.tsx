import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Dashboard</h1>
      <p className="mb-6 text-sm text-neutral-400">Yahan se site ke sections manage karo.</p>

      <Link
        href="/admin/slides"
        className="inline-block border border-neutral-700 px-6 py-5 hover:border-brand"
      >
        <p className="font-semibold">Hero Slides</p>
        <p className="text-sm text-neutral-400">Home page ke slider ki images aur text</p>
      </Link>
    </div>
  );
}