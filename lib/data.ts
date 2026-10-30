import { cacheTag } from "next/cache";
import type { Brand, FanCard, FanModel, Product, Slide } from "@/types";
import FanModelDoc from "@/models/FanModel";
import FanCardModel from "@/models/FanCard";
import { connectDB } from "@/lib/mongodb";
import SlideModel from "@/models/Slide";
import { isValidObjectId } from "mongoose";

// Slides ab MongoDB se aati hain (admin panel se upload hoti hain)
export async function getSlides(): Promise<Slide[]> {
  "use cache";
  cacheTag("slides");

  await connectDB();
  const docs = await SlideModel.find().sort({ createdAt: 1 }).lean();

  return docs.map((d) => ({
    id: String(d._id),
    image: d.image,
    eyebrow: d.eyebrow,
    title: d.title,
    primaryBtn: d.primaryBtn,
    secondaryBtn: d.secondaryBtn,
  }));
}
export async function getFanCards(): Promise<FanCard[]> {
  "use cache";
  cacheTag("fan-cards");

  await connectDB();
  const docs = await FanCardModel.find().sort({ createdAt: 1 }).lean();

  return docs.map((d) => ({
    id: String(d._id),
    image: d.image,
    label: d.label,
    href: d.href,
  }));
}
type FanModelLean = {
  _id: { toString(): string };
  name: string;
  price?: number | null;
  oldPrice?: number | null;
  image: string;
  category: string;
  sizes?: string[];
  inStock?: boolean;
  colors?: { _id: { toString(): string }; name: string; hex: string; image: string }[];
};

function toFanModel(d: FanModelLean): FanModel {
  return {
    id: String(d._id),
    name: d.name,
    price: d.price ?? null,
    oldPrice: d.oldPrice ?? null,
    image: d.image,
    category: d.category,
    sizes: d.sizes ?? [],
    inStock: d.inStock ?? true,
    colors: (d.colors ?? []).map((c) => ({
      id: String(c._id),
      name: c.name,
      hex: c.hex,
      image: c.image,
    })),
  };
}

export async function getFanModels(category?: string): Promise<FanModel[]> {
  "use cache";
  cacheTag("fan-models");

  await connectDB();
  const docs = await FanModelDoc.find(category ? { category } : {})
    .sort({ createdAt: 1 })
    .lean();
  return docs.map((d) => toFanModel(d));
}

export async function getFanModel(id: string): Promise<FanModel | null> {
  "use cache";
  cacheTag("fan-models");

  if (!isValidObjectId(id)) return null;
  await connectDB();
  const d = await FanModelDoc.findById(id).lean();
  return d ? toFanModel(d) : null;
}

// Images abhi placeholder (.svg) hain. Apni real images public/images/ mein rakho
// aur yahan path badal do (e.g. "/images/products/orient.png").
const brands: Brand[] = [
  { id: 1, name: "Khurshid Fan", image: "/images/brands/khurshid.svg" },
  { id: 2, name: "SK Fan", image: "/images/brands/sk.svg" },
  { id: 3, name: "Agha Fan", image: "/images/brands/agha.svg" },
  { id: 4, name: "Polofan", image: "/images/brands/polofan.svg" },
];

const products: Product[] = [
  { id: 1, name: "Orient Ceiling Fan", model: "Orient-56", image: "/images/products/orient.svg", price: 7999, oldPrice: 9999, rating: 4, reviews: 140, badge: "Hot Deal", badgeColor: "bg-red-600" },
  { id: 2, name: "Pak Fan Pedestal Fan", model: "PF-16", image: "/images/products/pedestal.svg", price: 12500, oldPrice: 16000, rating: 4, reviews: 86, badge: "Best Seller", badgeColor: "bg-green-600" },
  { id: 3, name: "GFC Table Fan", model: "GFC-12", image: "/images/products/table.svg", price: 6800, oldPrice: 8500, rating: 4, reviews: 91, badge: "Popular", badgeColor: "bg-blue-600" },
  { id: 4, name: "Super Asia Exhaust Fan", model: "EA-12", image: "/images/products/exhaust.svg", price: 4200, oldPrice: 5000, rating: 4, reviews: 72, badge: "Trending", badgeColor: "bg-purple-600" },
  { id: 5, name: "Kenwood Air Cooler", model: "KAC-120", image: "/images/products/cooler.svg", price: 28000, oldPrice: 34000, rating: 4, reviews: 145, badge: "Sale", badgeColor: "bg-orange-500" },
  { id: 6, name: "LED Bulb 12W", model: "Energy Saver", image: "/images/products/bulb.svg", price: 250, oldPrice: 400, rating: 4, reviews: 64, badge: "New", badgeColor: "bg-gray-700" },
];

// Baad mein yahan MongoDB queries laga sakte ho, baqi code same rahega.
export async function getBrands(): Promise<Brand[]> {
  return brands;
}

export async function getProducts(query?: string): Promise<Product[]> {
  if (!query) return products;
  const q = query.toLowerCase();
  return products.filter((p) => `${p.name} ${p.model}`.toLowerCase().includes(q));
}

export async function getProduct(id: number): Promise<Product | undefined> {
  return products.find((p) => p.id === id);
}