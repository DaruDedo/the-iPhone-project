import caseOrange from "@/assets/case-orange.jpg";
import type { ProductMediaKind } from "@/lib/product-media";

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
  kind?: ProductMediaKind;
  embedUrl?: string | null;
};

export type ProductModelOption = {
  id: string;
  variantId?: string;
  inventoryId?: string;
  name: string;
  slug: string;
  sku: string;
  price?: number;
  mrp?: number;
  stock: number;
  isAvailable: boolean;
};

export type ProductColor = {
  name: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  categoryId?: string;
  collectionId?: string;
  requiresModelFit: boolean;
  defaultModelSlug: string;
  collection: string;
  collectionSlug: string;
  model: string;
  price: number;
  mrp: number;
  image: ProductImage;
  images: ProductImage[];
  tint: string;
  tag: string;
  rating: number;
  reviews: number;
  description: string;
  colors: ProductColor[];
  models: string[];
  modelOptions: ProductModelOption[];
  selectedModel?: ProductModelOption;
  features: string[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

export type Collection = {
  id: string;
  slug: string;
  title: string;
  desc: string;
  count: string;
  sortOrder: number;
  isActive: boolean;
};

export type ProductCategory = {
  id: string;
  slug: string;
  title: string;
  desc: string;
  sortOrder: number;
  isActive: boolean;
};

export type IphoneModel = {
  id: string;
  slug: string;
  name: string;
  generation: number;
  sortOrder: number;
  isPopular: boolean;
  isActive: boolean;
};

export const iphoneModels: IphoneModel[] = [
  ["iphone-17-pro-max", "iPhone 17 Pro Max", 17, true],
  ["iphone-17-pro", "iPhone 17 Pro", 17, true],
  ["iphone-17", "iPhone 17", 17, true],
  ["iphone-air", "iPhone Air", 17, false],
  ["iphone-16-pro-max", "iPhone 16 Pro Max", 16, true],
  ["iphone-16-pro", "iPhone 16 Pro", 16, true],
  ["iphone-16-plus", "iPhone 16 Plus", 16, false],
  ["iphone-16", "iPhone 16", 16, true],
  ["iphone-16e", "iPhone 16e", 16, false],
  ["iphone-15-pro-max", "iPhone 15 Pro Max", 15, false],
  ["iphone-15-pro", "iPhone 15 Pro", 15, false],
  ["iphone-15-plus", "iPhone 15 Plus", 15, false],
  ["iphone-15", "iPhone 15", 15, true],
  ["iphone-14-pro-max", "iPhone 14 Pro Max", 14, false],
  ["iphone-14-pro", "iPhone 14 Pro", 14, false],
  ["iphone-14-plus", "iPhone 14 Plus", 14, false],
  ["iphone-14", "iPhone 14", 14, false],
  ["iphone-13-pro-max", "iPhone 13 Pro Max", 13, false],
  ["iphone-13-pro", "iPhone 13 Pro", 13, false],
  ["iphone-13", "iPhone 13", 13, false],
  ["iphone-13-mini", "iPhone 13 mini", 13, false],
  ["iphone-12-pro-max", "iPhone 12 Pro Max", 12, false],
  ["iphone-12-pro", "iPhone 12 Pro", 12, false],
  ["iphone-12", "iPhone 12", 12, false],
  ["iphone-12-mini", "iPhone 12 mini", 12, false],
].map(([slug, name, generation, isPopular], index) => ({
  id: String(slug),
  slug: String(slug),
  name: String(name),
  generation: Number(generation),
  sortOrder: index + 1,
  isPopular: Boolean(isPopular),
  isActive: true,
}));

export const modelOptions = iphoneModels.map((model) => model.name);
export const popularModelOptions = iphoneModels
  .filter((model) => model.isPopular)
  .map((model) => model.name);

export const colors: ProductColor[] = [
  { name: "Cosmic Orange", value: "var(--orange-tint)" },
  { name: "Sky Blue", value: "var(--blue-tint)" },
  { name: "Lavender", value: "var(--purple-tint)" },
  { name: "Blush Pink", value: "var(--pink-tint)" },
  { name: "Space Black", value: "oklch(0.2 0.005 270)" },
];

export const productCategories: ProductCategory[] = [
  {
    id: "covers-cases",
    slug: "covers-cases",
    title: "Covers & Cases",
    desc: "Everyday iPhone protection, style, and MagSafe-ready cases.",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "tempered-glass",
    slug: "tempered-glass",
    title: "Tempered Glass",
    desc: "Screen protectors, privacy glass, and edge-to-edge protection.",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "camera-protection",
    slug: "camera-protection",
    title: "Camera Protection",
    desc: "Lens protectors and camera guards for iPhone.",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "magsafe-wallets",
    slug: "magsafe-wallets",
    title: "MagSafe Wallets",
    desc: "Snap-on wallets made for MagSafe cases and iPhone.",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "accessories",
    slug: "accessories",
    title: "Accessories",
    desc: "Chargers, cables, stands, grips, and everyday iPhone add-ons.",
    sortOrder: 5,
    isActive: true,
  },
];

function createImage(productSlug: string, url: string, alt: string): ProductImage {
  return {
    id: `${productSlug}-primary`,
    url,
    alt,
    sortOrder: 1,
    isPrimary: true,
    kind: "image",
    embedUrl: null,
  };
}

export const products: Product[] = [];

export const placeholderProductImage = createImage(
  "placeholder-product",
  caseOrange.src,
  "The iPhone Project product image",
);

export const collections: Collection[] = [
  {
    id: "frosted-air",
    slug: "frosted-air",
    title: "Frosted Air",
    desc: "Translucent. Featherlight. 22g.",
    count: "12 colors",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "leather-edition",
    slug: "leather-edition",
    title: "Leather Edition",
    desc: "Full-grain leather with MagSafe.",
    count: "6 colors",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "clear-shield",
    slug: "clear-shield",
    title: "Clear Shield",
    desc: "Crystal clear, anti-yellowing protection.",
    count: "1 finish",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "studio-drops",
    slug: "studio-drops",
    title: "Studio Editions",
    desc: "Limited drops by Indian artists.",
    count: "4 designs",
    sortOrder: 4,
    isActive: true,
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCollectionBySlug(slug: string) {
  return collections.find((collection) => collection.slug === slug);
}

export function modelToSlug(model: string) {
  return model.toLowerCase().replace(/\s+/g, "-");
}

export function getModelBySlug(slug: string) {
  return iphoneModels.find((model) => model.slug === slug)?.name;
}

export function getIphoneModelBySlug(slug: string) {
  return iphoneModels.find((model) => model.slug === slug);
}

export function getPrimaryImage(product: Pick<Product, "image" | "images">) {
  return (
    product.images.find((image) => image.isPrimary && (image.kind ?? "image") === "image") ??
    product.images.find((image) => (image.kind ?? "image") === "image") ??
    product.image
  );
}
