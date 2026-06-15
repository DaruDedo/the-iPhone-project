import { getIphoneModels, getProductCategories, getProducts } from "@/lib/catalog";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const [products, categories, models] = await Promise.all([
    getProducts(),
    getProductCategories(),
    getIphoneModels(),
  ]);
  const body = [
    `# ${siteConfig.name}`,
    "",
    siteConfig.description,
    "",
    "## Important Pages",
    `- Home: ${absoluteUrl("/")}`,
    `- Search: ${absoluteUrl("/search")}`,
    `- Combos: ${absoluteUrl("/combos")}`,
    `- Offers: ${absoluteUrl("/offers")}`,
    `- Track order: ${absoluteUrl("/track-order")}`,
    "",
    "## Product Categories",
    ...categories.map(
      (category) => `- ${category.title}: ${absoluteUrl(`/category/${category.slug}`)}`,
    ),
    "",
    "## Popular iPhone Model Pages",
    ...models
      .filter((model) => model.isPopular)
      .map((model) => `- ${model.name}: ${absoluteUrl(`/iphone/${model.slug}`)}`),
    "",
    "## Featured Products",
    ...products
      .slice(0, 30)
      .map(
        (product) =>
          `- ${product.name} for ${product.selectedModel?.name ?? product.category}: ${absoluteUrl(`/products/${product.categorySlug}/${product.slug}`)}`,
      ),
    "",
    "## Store Facts",
    "- Ships across India.",
    "- COD and manual UPI are supported before payment gateway integration.",
    "- Product fit is selected by iPhone model where required.",
    "- Product images and variants are managed from the admin panel.",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
