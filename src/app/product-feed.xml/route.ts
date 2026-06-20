import { getProducts } from "@/lib/catalog";
import { productPath } from "@/lib/routes";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export const revalidate = 3600;

function escapeXml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const products = await getProducts();
  const items = products
    .map(
      (product) => `<item>
  <g:id>${escapeXml(product.slug)}</g:id>
  <g:title>${escapeXml(`${product.name} ${product.category}`)}</g:title>
  <g:description>${escapeXml(product.description)}</g:description>
  <g:link>${escapeXml(absoluteUrl(productPath(product)))}</g:link>
  <g:image_link>${escapeXml(absoluteUrl(product.image.url))}</g:image_link>
  <g:availability>${product.selectedModel?.stock === 0 ? "out_of_stock" : "in_stock"}</g:availability>
  <g:price>${escapeXml(`${product.price}.00 INR`)}</g:price>
  <g:brand>${escapeXml(siteConfig.name)}</g:brand>
  <g:condition>new</g:condition>
  <g:identifier_exists>false</g:identifier_exists>
  <g:google_product_category>Electronics &gt; Communications &gt; Telephony &gt; Mobile Phone Accessories &gt; Mobile Phone Cases</g:google_product_category>
  <g:product_type>${escapeXml(product.category)}</g:product_type>
  <g:custom_label_0>${escapeXml(product.selectedModel?.name ?? "Universal")}</g:custom_label_0>
  <g:shipping>
    <g:country>IN</g:country>
    <g:service>Standard</g:service>
    <g:price>0.00 INR</g:price>
  </g:shipping>
</item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${escapeXml(siteConfig.name)}</title>
<link>${escapeXml(siteConfig.url)}</link>
<description>${escapeXml(siteConfig.description)}</description>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
