"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  key: string;
  modelId: string;
  name: string;
  image: string;
  price: number;
  color?: string;
  size?: string;
  qty: number;
  href: string;
};

type Ctx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
    ready: boolean;
  clear: () => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
};

const CartContext = createContext<Ctx | null>(null);

function read<T>(k: string): T[] {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(read<CartItem>("cart"));
    setWishlist(read<string>("wishlist"));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("cart", JSON.stringify(items));
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [items, wishlist, ready]);

  function add(item: Omit<CartItem, "key">) {
    const key = [item.modelId, item.color ?? "", item.size ?? ""].join("|");
    setItems((prev) => {
      const found = prev.find((p) => p.key === key);
      if (found) {
        return prev.map((p) => (p.key === key ? { ...p, qty: p.qty + item.qty } : p));
      }
      return [...prev, { ...item, key }];
    });
  }

  function setQty(key: string, qty: number) {
    setItems((prev) =>
      prev.map((p) => (p.key === key ? { ...p, qty: Math.max(1, qty) } : p))
    );
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((p) => p.key !== key));
  }
    function clear() {
    setItems([]);
  }

  function toggleWish(id: string) {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.qty * i.price, 0);

  return (
    <CartContext.Provider
           value={{ items, count, total, add, setQty, remove, clear, ready, wishlist, toggleWish }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}