import type { MetadataRoute } from "next";

import { absoluteUrl, siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/checkout"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/admin", "/checkout"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/admin", "/checkout"],
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
        disallow: ["/admin", "/checkout"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin", "/checkout"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
