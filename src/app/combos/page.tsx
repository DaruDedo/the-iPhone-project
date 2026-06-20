import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getProductCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "iPhone Combos",
  description:
    "Shop iPhone protection combos with cases, tempered glass, camera protection, MagSafe wallets, and accessories from The iPhone Project.",
};

export const revalidate = 60;

const comboCards = [
  {
    title: "Case + Tempered Glass",
    text: "A daily protection set for people who want one clean setup for drops and scratches.",
    href: "/category/covers-cases",
  },
  {
    title: "Case + Camera Protection",
    text: "Protect the body and the camera island without making the iPhone feel bulky.",
    href: "/category/camera-protection",
  },
  {
    title: "MagSafe Travel Kit",
    text: "Pair a MagSafe wallet or power bank with your favorite iPhone cover.",
    href: "/category/magsafe-wallets",
  },
];

export default async function CombosPage() {
  const [products, categories] = await Promise.all([getProducts(), getProductCategories()]);
  const comboProducts = products.filter(
    (product) =>
      product.categorySlug === "covers-cases" ||
      product.categorySlug === "tempered-glass" ||
      product.categorySlug === "camera-protection" ||
      product.categorySlug === "magsafe-wallets",
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Combos</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold md:text-7xl">
          Build your iPhone protection kit.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Start with a cover, then add screen protection, camera protection, and MagSafe essentials
          for the same iPhone model.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-full border border-border px-4 py-2 text-sm transition hover:border-foreground/35"
            >
              {category.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-3 pb-16 sm:grid-cols-3 sm:px-6">
        {comboCards.map((combo) => (
          <Link
            key={combo.title}
            href={combo.href}
            className="rounded-3xl border border-border bg-card p-6 transition hover:border-foreground/35"
          >
            <h2 className="text-2xl font-bold">{combo.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{combo.text}</p>
            <p className="mt-6 text-sm font-medium">Shop this combo</p>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-7xl border-t border-border px-3 py-16 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Recommended
            </p>
            <h2 className="text-4xl font-bold md:text-6xl">Combo-ready products.</h2>
          </div>
          <Link
            href="/shop"
            className="rounded-full border border-border px-5 py-2 text-sm font-medium transition hover:border-foreground/35"
          >
            All products
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-5">
          {comboProducts.slice(0, 10).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
