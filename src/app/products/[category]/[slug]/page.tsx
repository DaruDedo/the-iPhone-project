import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductPageView } from "@/components/product-page-view";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { productPath } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.categorySlug !== category) {
    return { title: "Product not found" };
  }

  const path = productPath(product);

  return {
    title: `${product.name} ${product.category} for iPhone`,
    description: product.description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${product.name} ${product.category} for iPhone`,
      description: product.description,
      url: absoluteUrl(path),
      images: [
        {
          url: product.image.url,
          alt: `${product.name} ${product.category} product image`,
        },
      ],
      type: "website",
    },
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    category: product.categorySlug,
    slug: product.slug,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || product.categorySlug !== category) {
    notFound();
  }

  return <ProductPageView slug={slug} />;
}
