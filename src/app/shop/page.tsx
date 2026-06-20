import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getIphoneModels, getProductCategories, getProducts } from "@/lib/catalog";
import { productPath } from "@/lib/routes";
import { absoluteUrl, JsonLd, productJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop all iPhone covers, cases, tempered glass, wallets, and accessories.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "Shop The iPhone Project",
    description: "Shop all iPhone covers, cases, tempered glass, wallets, and accessories.",
    url: absoluteUrl("/shop"),
    type: "website",
  },
};

export const revalidate = 60;

export default async function ShopPage() {
  const [products, categories, models] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getIphoneModels(),
  ]);
  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Shop The iPhone Project",
    description: "All iPhone covers, cases, tempered glass, wallets, and accessories.",
    url: absoluteUrl("/shop"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(productPath(product)),
        item: productJsonLd(product),
      })),
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd data={pageJsonLd} />
      <section className="mx-auto max-w-7xl px-3 pb-8 pt-8 sm:px-6 md:pb-10 md:pt-14">
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">Shop</p>
        <h1 className="text-5xl font-bold md:text-7xl">All products.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          Browse every cover, case, tempered glass, wallet, and accessory available from The iPhone
          Project.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs transition hover:border-foreground/35"
            >
              {category.title}
            </Link>
          ))}
          {models
            .filter((model) => model.isPopular)
            .slice(0, 6)
            .map((model) => (
              <Link
                key={model.slug}
                href={`/iphone/${model.slug}`}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs transition hover:border-foreground/35"
              >
                {model.name}
              </Link>
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 pb-24 sm:px-6">
        <div className="mb-6 text-sm text-muted-foreground">{products.length} products</div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No products are available yet.
          </div>
        )}
      </section>
    </main>
  );
}
