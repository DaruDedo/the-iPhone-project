import caseBlue from "@/assets/case-blue.jpg";
import caseOrange from "@/assets/case-orange.jpg";
import casePink from "@/assets/case-pink.jpg";
import casePurple from "@/assets/case-purple.jpg";
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

function createModelInventory(productSlug: string): ProductModelOption[] {
  return iphoneModels.map((model) => ({
    id: model.id,
    variantId: `${productSlug}-${model.slug}`,
    inventoryId: `${productSlug}-${model.slug}`,
    name: model.name,
    slug: model.slug,
    sku: `${productSlug.toUpperCase().replace(/-/g, "-")}-${model.slug.toUpperCase()}`,
    stock: 25,
    isAvailable: model.isActive,
  }));
}

function createProduct(input: {
  slug: string;
  name: string;
  category?: string;
  categorySlug?: string;
  requiresModelFit?: boolean;
  collection: string;
  collectionSlug: string;
  defaultModelSlug: string;
  model: string;
  price: number;
  mrp: number;
  imageUrl: string;
  tint: string;
  tag: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  sortOrder: number;
}): Product {
  const image = createImage(input.slug, input.imageUrl, `${input.name} product image`);
  const requiresModelFit = input.requiresModelFit ?? true;
  const modelInventory = requiresModelFit
    ? createModelInventory(input.slug)
    : [
        {
          id: `${input.slug}-universal`,
          variantId: `${input.slug}-universal`,
          inventoryId: `${input.slug}-universal`,
          name: "Universal",
          slug: "universal",
          sku: `${input.slug.toUpperCase().replace(/-/g, "-")}-UNIVERSAL`,
          stock: 25,
          isAvailable: true,
        },
      ];
  const selectedModel = requiresModelFit
    ? modelInventory.find((model) => model.slug === input.defaultModelSlug)
    : modelInventory[0];

  return {
    id: input.slug,
    slug: input.slug,
    name: input.name,
    category: input.category ?? "Covers & Cases",
    categorySlug: input.categorySlug ?? "covers-cases",
    requiresModelFit,
    defaultModelSlug: input.defaultModelSlug,
    collection: input.collection,
    collectionSlug: input.collectionSlug,
    model: input.model,
    price: input.price,
    mrp: input.mrp,
    image,
    images: [image],
    tint: input.tint,
    tag: input.tag,
    rating: input.rating,
    reviews: input.reviews,
    description: input.description,
    colors,
    models: requiresModelFit
      ? modelInventory.filter((model) => model.isAvailable).map((model) => model.name)
      : [],
    modelOptions: modelInventory,
    selectedModel,
    features: input.features,
    seoTitle: null,
    seoDescription: null,
    isActive: true,
    isFeatured: true,
    sortOrder: input.sortOrder,
  };
}

export const products: Product[] = [
  createProduct({
    slug: "cosmic-orange-frosted-air",
    name: "Cosmic Orange",
    collection: "Frosted Air",
    collectionSlug: "frosted-air",
    defaultModelSlug: "iphone-17-pro",
    model: "Frosted Air for iPhone 17 Pro",
    price: 1499,
    mrp: 1999,
    imageUrl: caseOrange.src,
    tint: "var(--orange-tint)",
    tag: "Bestseller",
    rating: 4.9,
    reviews: 218,
    description:
      "A featherlight translucent case tuned to the orange iPhone finish, with reinforced corners and a clean MagSafe snap.",
    features: ["22g shell", "3m drop tested", "MagSafe ready", "Raised camera lip"],
    sortOrder: 1,
  }),
  createProduct({
    slug: "sky-blue-frosted-air",
    name: "Sky Blue",
    collection: "Frosted Air",
    collectionSlug: "frosted-air",
    defaultModelSlug: "iphone-17",
    model: "Frosted Air for iPhone 17",
    price: 1299,
    mrp: 1799,
    imageUrl: caseBlue.src,
    tint: "var(--blue-tint)",
    tag: "New",
    rating: 4.8,
    reviews: 176,
    description:
      "Soft blue protection with a satin grip, clicky buttons, and exact cutouts for the newest iPhone line.",
    features: ["Anti-slip rails", "MagSafe ready", "Soft microfiber rim", "7-day returns"],
    sortOrder: 2,
  }),
  createProduct({
    slug: "lavender-frosted-air",
    name: "Lavender",
    collection: "Frosted Air",
    collectionSlug: "frosted-air",
    defaultModelSlug: "iphone-air",
    model: "Frosted Air for iPhone Air",
    price: 1399,
    mrp: 1899,
    imageUrl: casePurple.src,
    tint: "var(--purple-tint)",
    tag: "Limited",
    rating: 4.9,
    reviews: 143,
    description:
      "A limited lavender finish made for slimmer phones, balancing everyday protection with a barely-there feel.",
    features: ["Slim profile", "3m drop tested", "Precision buttons", "COD available"],
    sortOrder: 3,
  }),
  createProduct({
    slug: "blush-pink-frosted-air",
    name: "Blush Pink",
    collection: "Frosted Air",
    collectionSlug: "frosted-air",
    defaultModelSlug: "iphone-17",
    model: "Frosted Air for iPhone 17",
    price: 1299,
    mrp: 1799,
    imageUrl: casePink.src,
    tint: "var(--pink-tint)",
    tag: "Trending",
    rating: 4.9,
    reviews: 201,
    description:
      "Warm pink, clean edges, and all-day scratch protection for customers who want a softer iPhone look.",
    features: ["Scratch resistant", "Wireless charging", "Raised screen edge", "Free shipping"],
    sortOrder: 4,
  }),
  createProduct({
    slug: "space-black-frosted-air",
    name: "Space Black",
    collection: "Frosted Air",
    collectionSlug: "frosted-air",
    defaultModelSlug: "iphone-16-pro-max",
    model: "Frosted Air for iPhone 16 Pro Max",
    price: 1499,
    mrp: 1999,
    imageUrl: caseOrange.src,
    tint: "oklch(0.2 0.005 270)",
    tag: "New",
    rating: 4.9,
    reviews: 94,
    description:
      "A smoked translucent finish with slim corner protection and a clean MagSafe snap.",
    features: ["Smoked finish", "MagSafe ready", "Raised lens lip", "Slim everyday grip"],
    sortOrder: 5,
  }),
  createProduct({
    slug: "arctic-clear-frosted-air",
    name: "Arctic Clear",
    collection: "Frosted Air",
    collectionSlug: "frosted-air",
    defaultModelSlug: "iphone-16-pro",
    model: "Frosted Air for iPhone 16 Pro",
    price: 1199,
    mrp: 1699,
    imageUrl: caseBlue.src,
    tint: "var(--blue-tint)",
    tag: "Fresh",
    rating: 4.8,
    reviews: 88,
    description:
      "A clean frosted clear case made for customers who want the iPhone finish to stay visible.",
    features: ["Frosted clear back", "Wireless charging", "Soft rails", "7-day returns"],
    sortOrder: 6,
  }),
  createProduct({
    slug: "mist-purple-frosted-air",
    name: "Mist Purple",
    collection: "Frosted Air",
    collectionSlug: "frosted-air",
    defaultModelSlug: "iphone-15-pro",
    model: "Frosted Air for iPhone 15 Pro",
    price: 1299,
    mrp: 1799,
    imageUrl: casePurple.src,
    tint: "var(--purple-tint)",
    tag: "Limited",
    rating: 4.8,
    reviews: 76,
    description:
      "A soft purple translucent cover with exact iPhone cutouts and pocket-friendly protection.",
    features: ["Soft-touch finish", "3m drop tested", "Camera lip", "COD available"],
    sortOrder: 7,
  }),
  createProduct({
    slug: "rose-crystal-frosted-air",
    name: "Rose Crystal",
    collection: "Frosted Air",
    collectionSlug: "frosted-air",
    defaultModelSlug: "iphone-15",
    model: "Frosted Air for iPhone 15",
    price: 1199,
    mrp: 1699,
    imageUrl: casePink.src,
    tint: "var(--pink-tint)",
    tag: "Trending",
    rating: 4.9,
    reviews: 112,
    description:
      "A rose-tinted frosted case for a softer iPhone look with everyday scratch protection.",
    features: ["Rose tint", "Anti-scratch back", "Raised screen edge", "Free shipping"],
    sortOrder: 8,
  }),
  createProduct({
    slug: "edge-privacy-tempered-glass",
    name: "Edge Privacy Glass",
    category: "Tempered Glass",
    categorySlug: "tempered-glass",
    collection: "Clear Shield",
    collectionSlug: "clear-shield",
    defaultModelSlug: "iphone-17-pro",
    model: "Privacy glass for iPhone 17 Pro",
    price: 699,
    mrp: 999,
    imageUrl: caseBlue.src,
    tint: "var(--blue-tint)",
    tag: "New",
    rating: 4.8,
    reviews: 61,
    description:
      "Edge-to-edge privacy tempered glass with clean touch response and everyday scratch protection.",
    features: ["9H hardness", "Privacy filter", "Case friendly", "Easy install tray"],
    sortOrder: 9,
  }),
  createProduct({
    slug: "crystal-clear-tempered-glass",
    name: "Crystal Clear Glass",
    category: "Tempered Glass",
    categorySlug: "tempered-glass",
    collection: "Clear Shield",
    collectionSlug: "clear-shield",
    defaultModelSlug: "iphone-16-pro",
    model: "Tempered glass for iPhone 16 Pro",
    price: 499,
    mrp: 799,
    imageUrl: casePurple.src,
    tint: "var(--purple-tint)",
    tag: "Fresh",
    rating: 4.8,
    reviews: 48,
    description:
      "Crystal-clear tempered glass made for sharp display clarity, smooth swipes, and daily scratch defence.",
    features: ["9H hardness", "Oleophobic coating", "Bubble-free install", "Case friendly"],
    sortOrder: 10,
  }),
  createProduct({
    slug: "camera-lens-guard",
    name: "Camera Lens Guard",
    category: "Camera Protection",
    categorySlug: "camera-protection",
    collection: "Clear Shield",
    collectionSlug: "clear-shield",
    defaultModelSlug: "iphone-17-pro",
    model: "Camera protection for iPhone 17 Pro",
    price: 399,
    mrp: 699,
    imageUrl: casePink.src,
    tint: "var(--pink-tint)",
    tag: "Trending",
    rating: 4.7,
    reviews: 42,
    description:
      "Slim camera lens protection that guards against scratches without dulling photos or flash.",
    features: ["HD lens clarity", "Flash safe", "Scratch resistant", "Easy alignment"],
    sortOrder: 11,
  }),
  createProduct({
    slug: "snap-magsafe-wallet",
    name: "Snap MagSafe Wallet",
    category: "MagSafe Wallets",
    categorySlug: "magsafe-wallets",
    requiresModelFit: false,
    collection: "Leather Edition",
    collectionSlug: "leather-edition",
    defaultModelSlug: "universal",
    model: "MagSafe Wallet",
    price: 1499,
    mrp: 1999,
    imageUrl: caseOrange.src,
    tint: "var(--orange-tint)",
    tag: "New",
    rating: 4.9,
    reviews: 35,
    description:
      "A slim magnetic wallet for cards, built to snap cleanly onto MagSafe iPhones and cases.",
    features: ["MagSafe snap", "2-card carry", "Soft-touch finish", "Works with MagSafe cases"],
    sortOrder: 12,
  }),
  createProduct({
    slug: "magsafe-power-bank",
    name: "MagSafe Power Bank",
    category: "Accessories",
    categorySlug: "accessories",
    requiresModelFit: false,
    collection: "Studio Editions",
    collectionSlug: "studio-drops",
    defaultModelSlug: "universal",
    model: "MagSafe Power Bank",
    price: 2499,
    mrp: 3299,
    imageUrl: caseBlue.src,
    tint: "var(--blue-tint)",
    tag: "Limited",
    rating: 4.8,
    reviews: 29,
    description:
      "Pocketable MagSafe power for travel days, commutes, and long shoots away from a charger.",
    features: ["MagSafe compatible", "USB-C input", "Pocket size", "LED battery indicator"],
    sortOrder: 13,
  }),
  createProduct({
    slug: "usb-c-braided-cable",
    name: "USB-C Braided Cable",
    category: "Accessories",
    categorySlug: "accessories",
    requiresModelFit: false,
    collection: "Studio Editions",
    collectionSlug: "studio-drops",
    defaultModelSlug: "universal",
    model: "USB-C Cable",
    price: 599,
    mrp: 899,
    imageUrl: casePurple.src,
    tint: "var(--purple-tint)",
    tag: "Essential",
    rating: 4.7,
    reviews: 54,
    description:
      "A durable braided USB-C cable for fast daily charging and dependable desk or travel use.",
    features: ["Braided shell", "Fast charging", "1.2m length", "Travel friendly"],
    sortOrder: 14,
  }),
];

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
