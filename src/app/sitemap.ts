import type { MetadataRoute } from "next";

import { blogPosts } from "@/data/blog";
import { getCollections, getIphoneModels, getProductCategories, getProducts } from "@/lib/catalog";
import { productPath } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [products, collections, models, categories] = await Promise.all([
    getProducts(),
    getCollections(),
    getIphoneModels(),
    getProductCategories(),
  ]);

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...[
      "/search",
      "/shop",
      "/combos",
      "/offers",
      "/track-order",
      "/llms-full.txt",
      "/product-feed.xml",
      "/shipping",
      "/returns",
      "/warranty",
      "/contact",
      "/privacy",
      "/terms",
    ].map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.45,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(productPath(product)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...collections.map((collection) => ({
      url: absoluteUrl(`/collections/${collection.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/category/${category.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...models.map((model) => ({
      url: absoluteUrl(`/iphone/${model.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...blogPosts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.55,
    })),
  ];
}
