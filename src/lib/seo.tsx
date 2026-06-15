import type { Product } from "@/data/products";
import { getStaticProductReviews } from "@/lib/product-reviews";
import { productPath } from "@/lib/routes";
import { siteConfig } from "@/lib/site";

export { siteConfig };

export function absoluteUrl(path = "/") {
  if (path.startsWith("http")) {
    return path;
  }

  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/icon.png"),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteConfig.phone,
      contactType: "customer support",
      areaServed: "IN",
      availableLanguage: ["en", "hi"],
    },
    sameAs: ["https://www.instagram.com/theiphoneproject"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(product: Product) {
  const reviews = getStaticProductReviews(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${product.collection} ${product.category}`,
    image: [absoluteUrl(product.image.url)],
    description: product.description,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: product.category,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Compatible iPhone models",
        value: product.requiresModelFit ? product.models.join(", ") : "Universal iPhone accessory",
      },
      {
        "@type": "PropertyValue",
        name: "Collection",
        value: product.collection,
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
    review: reviews.map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.name,
      },
      reviewBody: review.quote,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
      },
    })),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(productPath(product)),
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
          currency: "INR",
        },
      },
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
