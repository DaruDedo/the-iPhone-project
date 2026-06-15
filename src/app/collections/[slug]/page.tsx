import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { getCollectionBySlug, getCollections, getProductsByCollection } from "@/lib/catalog";
import { productPath } from "@/lib/routes";
import { absoluteUrl, breadcrumbJsonLd, JsonLd, productJsonLd } from "@/lib/seo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map(({ slug }) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  return {
    title: collection ? `${collection.title} iPhone Covers` : "Collection",
    description: collection
      ? `${collection.desc} Shop ${collection.title} iPhone covers and cases from The iPhone Project with free shipping across India.`
      : undefined,
    alternates: collection
      ? {
          canonical: `/collections/${collection.slug}`,
        }
      : undefined,
    openGraph: collection
      ? {
          title: `${collection.title} iPhone Covers`,
          description: collection.desc,
          url: absoluteUrl(`/collections/${collection.slug}`),
          type: "website",
        }
      : undefined,
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const collectionProducts = await getProductsByCollection(slug);
  const pageJsonLd = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Collections", url: "/#collections" },
      { name: collection.title, url: `/collections/${collection.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${collection.title} iPhone covers`,
      description: collection.desc,
      url: absoluteUrl(`/collections/${collection.slug}`),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: collectionProducts.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(productPath(product)),
          item: productJsonLd(product),
        })),
      },
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd data={pageJsonLd} />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <Link href="/#collections" className="text-sm text-muted-foreground hover:text-foreground">
          Back to collections
        </Link>
        <div className="mt-10 max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {collection.count}
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">{collection.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">{collection.desc}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {collectionProducts.map((product) => (
            <ProductCard key={`${collection.slug}-${product.slug}`} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
