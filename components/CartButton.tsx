"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartButton() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="relative" aria-label={`Cart (${count} items)`}>
      <ShoppingCart size={22} />
      <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-black">
        {count}
      </span>
    </Link>
  );
}