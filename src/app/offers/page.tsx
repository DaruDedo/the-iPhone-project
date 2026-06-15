import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "iPhone Offers",
  description:
    "Shop launch offers, free shipping, COD, and bundle-ready iPhone accessories from The iPhone Project.",
};

export const revalidate = 60;

const offerCards = [
  ["Free India shipping", "No shipping charge on orders above Rs. 999."],
  ["COD available", "Cash on delivery is available on supported Indian pin codes."],
  ["7-day returns", "Return eligible unused products within 7 days of delivery."],
];

export default async function OffersPage() {
  const products = await getProducts();
  const launchProducts = products
    .filter((product) =>
      ["new", "bestseller", "trending", "limited"].includes(product.tag.toLowerCase()),
    )
    .slice(0, 10);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Offers</p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold md:text-7xl">Launch deals.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Current The iPhone Project offers for iPhone covers, tempered glass, camera protection,
          MagSafe wallets, and accessories.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-3 pb-16 sm:grid-cols-3 sm:px-6">
        {offerCards.map(([title, text]) => (
          <div key={title} className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-7xl border-t border-border px-3 py-16 sm:px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Featured offers
            </p>
            <h2 className="text-4xl font-bold md:text-6xl">Shop active deals.</h2>
          </div>
          <Link
            href="/combos"
            className="rounded-full border border-border px-5 py-2 text-sm font-medium transition hover:border-foreground/35"
          >
            View combos
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-5">
          {(launchProducts.length ? launchProducts : products.slice(0, 10)).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
