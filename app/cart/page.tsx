import Header from "@/components/Header";
import CartView from "@/components/CartView";

export default function CartPage() {
  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header />
      </header>
      <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
        <CartView />
      </main>
    </>
  );
}