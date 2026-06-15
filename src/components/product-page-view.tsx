import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductDetailTabs } from "@/components/product-detail-tabs";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { ProductFaq } from "@/components/product-faq";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { ProductReviews } from "@/components/product-reviews";
import { ProductWhyUs } from "@/components/product-why-us";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { getProductFaqs } from "@/lib/product-faqs";
import { productPath } from "@/lib/routes";
import { breadcrumbJsonLd, JsonLd, productJsonLd } from "@/lib/seo";

export async function ProductPageView({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = (await getProducts()).filter((item) => item.slug !== product.slug).slice(0, 3);
  const productFaqs = getProductFaqs(product);
  const pageJsonLd = [
    productJsonLd(product),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: productFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: product.category, url: `/category/${product.categorySlug}` },
      { name: product.name, url: productPath(product) },
    ]),
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd data={pageJsonLd} />
      <section className="mx-auto grid max-w-7xl gap-7 px-3 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.85fr)] lg:items-start lg:gap-10 lg:py-12">
        <div className="lg:col-start-1">
          <ProductGallery product={product} />
        </div>
        <div className="lg:col-start-2">
          <ProductPurchasePanel product={product} />
        </div>
      </section>

      <ProductDetailTabs product={product} />

      <section className="mx-auto max-w-5xl px-3 pb-12 sm:px-6 md:pb-16">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {product.features.slice(0, 4).map((feature, index) => (
            <div key={`${feature}-${index}`} className="rounded-2xl bg-muted/45 p-4 sm:p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Feature
              </p>
              <p className="mt-2 text-sm font-bold leading-5 sm:text-base">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      <ProductWhyUs />
      <ProductReviews product={product} />
      <ProductFaq faqs={productFaqs} />

      <section className="mx-auto max-w-7xl px-3 py-12 sm:px-6 md:py-16">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Complete the set
            </p>
            <h2 className="text-4xl font-bold md:text-5xl">You may also like.</h2>
          </div>
          <Link href="/#shop" className="hidden text-sm font-medium md:block">
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
