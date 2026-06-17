import type { Metadata } from "next";

import { CartDrawer } from "@/components/cart-drawer";
import { CartProvider } from "@/components/cart-provider";
import { GlobalToastEvents } from "@/components/global-toast-events";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { JsonLd, organizationJsonLd, siteConfig, websiteJsonLd } from "@/lib/seo";

import "@/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "The iPhone Project - Premium iPhone Covers",
    template: "%s | The iPhone Project",
  },
  description: siteConfig.description,
  keywords: [
    "iPhone covers",
    "iPhone cases",
    "MagSafe iPhone case",
    "iPhone 17 case India",
    "premium iPhone covers India",
    "The iPhone Project cases",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The iPhone Project - Premium iPhone Covers",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "The iPhone Project - Premium iPhone Covers",
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
          <SiteHeader />
          {children}
          <SiteFooter />
          <CartDrawer />
          <WhatsAppFloat />
          <GlobalToastEvents />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
