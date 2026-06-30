import { absoluteUrl, siteConfig } from "@/lib/seo";

export const revalidate = 3600;

export async function GET() {
  const lines = [
    `# ${siteConfig.name} - India's Premium iPhone Accessories Hub`,
    "",
    `> ${siteConfig.description}`,
    "",
    "## About Us",
    `${siteConfig.name} is India's leading e-commerce store specializing in premium, model-specific iPhone accessories, covers, and cases. From drop-tested protective cases with MagSafe support to high-grade 8K premium tempered glass and camera lens protectors, we provide top-tier craftmanship for iPhones.`,
    "",
    "## Key Capabilities",
    "- **Wide Model Support**: Tailored accessories for iPhone 12, iPhone 13, iPhone 14, iPhone 15, iPhone 16, and iPhone 17 (including Pro, Pro Max, and Plus variants).",
    "- **Premium Materials**: Frosted matte backplates, titanium alloy bumpers, tactile aluminum buttons, and MagSafe snappable magnetic rings.",
    "- **Customer Services**: Cash on Delivery (COD) across India, secure UPI payments, free shipping on qualified orders, and a hassle-free 7-day return policy.",
    "",
    "## Key Store URLs",
    `- Home Page: ${absoluteUrl("/")}`,
    `- All Products (Shop): ${absoluteUrl("/shop")}`,
    `- Premium Combos: ${absoluteUrl("/combos")}`,
    `- Exclusive Offers: ${absoluteUrl("/offers")}`,
    `- Order Tracking: ${absoluteUrl("/track-order")}`,
    `- XML Product Feed: ${absoluteUrl("/product-feed.xml")}`,
    "",
    "## AI and Developer Resources",
    `- Full AI Catalog (Markdown): ${absoluteUrl("/llms-full.txt")}`,
    `- Dynamic Sitemap (XML): ${absoluteUrl("/sitemap.xml")}`,
    "",
    "## Contact Information",
    `- Email Support: ${siteConfig.email}`,
    `- Business Address: ${siteConfig.businessAddress}`,
  ].join("\n");

  return new Response(lines, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
