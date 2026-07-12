import { getIphoneModels, getProductCategories, getProducts } from "@/lib/catalog";
import { productPath } from "@/lib/routes";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { getStaticProductReviews } from "@/lib/product-reviews";
import { getBlogPosts } from "@/lib/blog";

export const revalidate = 3600;

export async function GET() {
  const [products, categories, models] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getIphoneModels(),
  ]);
  const blogPosts = getBlogPosts();
  
  const lines = [
    `# ${siteConfig.name} Full AI Catalog`,
    "",
    siteConfig.description,
    "",
    "## Store Capabilities",
    "- Premium iPhone covers and cases in India.",
    "- Tempered glass, camera protection, MagSafe wallets, and iPhone accessories.",
    "- Model-specific compatibility from iPhone 12 to iPhone 17 Pro Max.",
    "- COD and manual UPI supported before payment gateway integration.",
    "- Free shipping threshold and 7-day returns are part of the customer promise.",
    "",
    "## Key URLs",
    `- Home: ${absoluteUrl("/")}`,
    `- Search: ${absoluteUrl("/search")}`,
    `- Combos: ${absoluteUrl("/combos")}`,
    `- Offers: ${absoluteUrl("/offers")}`,
    `- Track Order: ${absoluteUrl("/track-order")}`,
    `- Product Feed: ${absoluteUrl("/product-feed.xml")}`,
    "",
    "## Categories",
    ...categories.flatMap((category) => [
      `### ${category.title}`,
      `URL: ${absoluteUrl(`/category/${category.slug}`)}`,
      category.desc,
      "",
    ]),
    "## iPhone Model Pages",
    ...models.map((model) => `- ${model.name}: ${absoluteUrl(`/iphone/${model.slug}`)}`),
    "",
    "## Products",
    ...products.flatMap((product) => {
      const reviews = getStaticProductReviews(product);
      const ratingText = `${product.rating || 4.9} / 5.0 (${product.reviews || 120} reviews)`;
      const sampleReviews = reviews.map((r) => `"${r.quote}" (by ${r.name})`).join(" | ");

      return [
        `### ${product.name}`,
        `URL: ${absoluteUrl(productPath(product))}`,
        `Category: ${product.category}`,
        `Default fit: ${product.selectedModel?.name ?? "Universal"}`,
        `Price: INR ${product.price}`,
        `Badge: ${product.tag}`,
        `Compatibility: ${
          product.requiresModelFit ? product.models.join(", ") : "Universal iPhone accessory"
        }`,
        `Customer Rating: ${ratingText}`,
        `Sample Reviews: ${sampleReviews}`,
        `Shipping: Free express shipping all over India (2-5 business days)`,
        `Trust Signals: Cash on Delivery (COD) supported, 7-day easy returns and replacement policy`,
        `Features: ${product.features.join(", ")}`,
        `Description: ${product.description}`,
        "",
      ];
    }),
    "## Blog Posts & Landing Guides",
    ...blogPosts.flatMap((post) => [
      `### ${post.title}`,
      `URL: ${absoluteUrl(`/blog/${post.slug}`)}`,
      `Excerpt: ${post.excerpt}`,
      `Topic/Tag: ${post.tag}`,
      `Read Time: ${post.readTime}`,
      `Outline: ${post.content.split("\n\n").slice(0, 2).join("\n")}`,
      "",
    ]),
  ].join("\n");

  return new Response(lines, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
