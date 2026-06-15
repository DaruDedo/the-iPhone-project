import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { getIphoneModels, getProductCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Search",
  description: "Search The iPhone Project iPhone covers and cases.",
};

export const revalidate = 60;

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = await searchParams;
  const searchTerm = Array.isArray(query.q) ? query.q[0] : (query.q ?? "");
  const normalizedSearch = normalize(searchTerm);
  const [products, categories, models] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getIphoneModels(),
  ]);
  const filteredProducts = normalizedSearch
    ? products.filter((product) => {
        const haystack = [
          product.name,
          product.model,
          product.category,
          product.collection,
          product.description,
          product.tag,
          product.price.toString(),
          ...product.models,
          ...product.features,
        ]
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalizedSearch);
      })
    : products;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Search</p>
        <h1 className="mt-4 text-5xl font-bold md:text-7xl">Find your cover.</h1>
        <form className="mt-10" action="/search">
          <input
            name="q"
            defaultValue={searchTerm}
            placeholder="Search by iPhone model or case name"
            className="h-12 w-full rounded-full border border-border bg-card px-5 text-sm outline-none focus:border-foreground/50"
          />
        </form>
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <a
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-foreground/35"
            >
              {category.title}
            </a>
          ))}
          {models
            .filter((model) => model.isPopular)
            .slice(0, 5)
            .map((model) => (
              <a
                key={model.slug}
                href={`/iphone/${model.slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-foreground/35"
              >
                {model.name}
              </a>
            ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-3 pb-24 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {normalizedSearch
              ? `${filteredProducts.length} results for "${searchTerm}"`
              : `${filteredProducts.length} products`}
          </p>
          {normalizedSearch && (
            <a href="/search" className="text-sm font-medium underline underline-offset-4">
              Clear search
            </a>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold">No products found.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try searching by iPhone model, product type, or category.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
