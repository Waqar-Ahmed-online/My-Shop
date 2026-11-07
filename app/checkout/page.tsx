import Header from "@/components/Header";
import CheckoutView from "@/components/CheckoutView";

export const metadata = { title: "Checkout | Abrar Store" };

export default function CheckoutPage() {
  return (
    <>
      <header className="border-b border-neutral-200 bg-white text-neutral-900">
        <Header />
      </header>
      <main className="min-h-screen bg-white px-4 py-10 sm:px-6">
        <CheckoutView />
      </main>
    </>
  );
}