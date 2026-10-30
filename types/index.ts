export type Product = {
  id: number;
  name: string;
  model: string;
  image: string;
  price: number;
  oldPrice: number;
  rating: number;
  reviews: number;
  badge: string;
  badgeColor: string; // tailwind class, e.g. "bg-red-600"
};

export type Brand = {
  id: number;
  name: string;
  image: string;
};
export type Slide = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  primaryBtn: string;
  secondaryBtn: string;
};
export type FanCard = {
  id: string;
  image: string;
  label: string;
  href: string;
};
export type FanColor = {
  id: string;
  name: string;
  hex: string;
  image: string;
};


export type FanModel = {
  id: string;
  name: string;
  price: number | null;
  oldPrice: number | null;
  image: string;
  category: string;
  sizes: string[];
  inStock: boolean;
  colors: FanColor[];
};