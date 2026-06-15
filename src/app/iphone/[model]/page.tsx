import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { getIphoneModels, getProductsByModel } from "@/lib/catalog";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const models = await getIphoneModels();
  return models.map((model) => ({ model: model.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}): Promise<Metadata> {
  const { model: modelSlug } = await params;
  const models = await getIphoneModels();
  const model = models.find((item) => item.slug === modelSlug);

  if (!model) {
    return { title: "iPhone covers" };
  }

  return {
    title: `${model.name} Covers and Cases`,
    description: `Shop premium ${model.name} covers and MagSafe cases from The iPhone Project with free shipping, COD, and 7-day returns across India.`,
    alternates: {
      canonical: `/iphone/${modelSlug}`,
    },
  };
}

export default async function IphoneModelPage({ params }: { params: Promise<{ model: string }> }) {
  const { model: modelSlug } = await params;
  const models = await getIphoneModels();
  const model = models.find((item) => item.slug === modelSlug);

  if (!model) {
    notFound();
  }

  const modelProducts = await getProductsByModel(modelSlug);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "iPhone models", url: "/#models" },
          { name: model.name, url: `/iphone/${modelSlug}` },
        ])}
      />
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <Link href="/#models" className="text-sm text-muted-foreground hover:text-foreground">
          Back to all models
        </Link>
        <div className="mt-10 max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            iPhone covers
          </p>
          <h1 className="text-5xl font-bold md:text-7xl">{model.name} cases.</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Premium covers made for {model.name} by The iPhone Project, with MagSafe support, slim
            protection, free shipping, COD, and 7-day returns.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 pb-24 sm:px-6">
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-5">
          {modelProducts.map((product) => (
            <ProductCard key={`${modelSlug}-${product.slug}`} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
