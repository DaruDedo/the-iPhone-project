import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { CategoryModelFilter } from "@/components/category-model-filter";
import { ProductCard } from "@/components/product-card";
import {
  getIphoneModels,
  getProductCategories,
  getProductCategoryBySlug,
  getProductsByCategory,
} from "@/lib/catalog";
import { productPath } from "@/lib/routes";
import { absoluteUrl, breadcrumbJsonLd, JsonLd, productJsonLd } from "@/lib/seo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getProductCategories();
  return categories.map(({ slug }) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getProductCategoryBySlug(slug);

  return {
    title: category ? `${category.title} for iPhone` : "Category",
    description: category
      ? `${category.desc} Shop ${category.title.toLowerCase()} for iPhone from The iPhone Project with free shipping across India.`
      : undefined,
    alternates: category
      ? {
          canonical: `/category/${category.slug}`,
        }
      : undefined,
    openGraph: category
      ? {
          title: `${category.title} for iPhone`,
          description: category.desc,
          url: absoluteUrl(`/category/${category.slug}`),
          type: "website",
        }
      : undefined,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ model?: string | string[] }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const selectedModelSlug = Array.isArray(query.model) ? query.model[0] : query.model;
  const category = await getProductCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [categoryProducts, iphoneModels] = await Promise.all([
    getProductsByCategory(slug),
    getIphoneModels(),
  ]);
  const visibleProducts = selectedModelSlug
    ? categoryProducts.flatMap((product) => {
        if (!product.requiresModelFit) {
          return [product];
        }

        const selectedModel = product.modelOptions.find(
          (model) => model.slug === selectedModelSlug && model.isAvailable,
        );

        if (!selectedModel) {
          return [];
        }

        return [
          {
            ...product,
            price: selectedModel.price ?? product.price,
            mrp: selectedModel.mrp ?? product.mrp,
            selectedModel,
            model: `${product.name} for ${selectedModel.name}`,
          },
        ];
      })
    : categoryProducts;
  const pageJsonLd = [
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Categories", url: "/shop" },
      { name: category.title, url: `/category/${category.slug}` },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category.title} for iPhone`,
      description: category.desc,
      url: absoluteUrl(`/category/${category.slug}`),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: visibleProducts.map((product, index) => ({
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
      <section className="mx-auto max-w-7xl px-3 pb-8 pt-8 sm:px-6 md:pb-10 md:pt-14">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to shop
        </Link>
        <div className="mt-7 max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">Category</p>
          <h1 className="text-5xl font-bold md:text-7xl">{category.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            {category.desc}
          </p>
          <CategoryModelFilter models={iphoneModels} selectedModelSlug={selectedModelSlug} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 pb-24 sm:px-6">
        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-5">
            {visibleProducts.map((product) => (
              <ProductCard key={`${category.slug}-${product.slug}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No products are available for this iPhone model yet.
          </div>
        )}
      </section>
    </main>
  );
}
