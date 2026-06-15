import type { Product } from "@/data/products";

export function productPath(product: Pick<Product, "categorySlug" | "slug">) {
  return `/products/${product.categorySlug}/${product.slug}`;
}
