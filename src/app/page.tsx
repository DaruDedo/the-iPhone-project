import Image from "next/image";
import Link from "next/link";

import heroImg from "@/assets/hero-iphone.png";
import { ModelFitSelector } from "@/components/model-fit-selector";
import { ProductCard } from "@/components/product-card";
import { getCollections, getProducts } from "@/lib/catalog";
import { productPath } from "@/lib/routes";
import { absoluteUrl, JsonLd, productJsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const reviews = [
  {
    name: "Aarav S.",
    text: "Lightest case I've owned. The Cosmic Orange finish looks made for the phone.",
    rating: 5,
  },
  {
    name: "Diya M.",
    text: "Dropped my 17 Pro on marble. Not a scratch. The grip is excellent.",
    rating: 5,
  },
  {
    name: "Kabir R.",
    text: "MagSafe snaps perfectly. Charging is cleaner than with my old case.",
    rating: 5,
  },
];

const faqs = [
  [
    "Will it fit my exact iPhone model?",
    "Yes. Pick your iPhone model before checkout and we ship the case cut for that exact device.",
  ],
  [
    "Does it work with MagSafe?",
    "Frosted Air and Clear Shield covers include a precision magnet array for MagSafe chargers, wallets, stands, and mounts.",
  ],
  [
    "What is the return window?",
    "You get 7 days from delivery. We arrange return pickup anywhere our logistics partners support it.",
  ],
  ["Is COD available?", "Yes. Cash on delivery is available across supported Indian pin codes."],
];

export const revalidate = 60;

function ProductGridSection({
  id,
  eyebrow,
  title,
  products,
  seeAllHref,
  withTopBorder = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  products: Awaited<ReturnType<typeof getProducts>>;
  seeAllHref: string;
  withTopBorder?: boolean;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      className={`mx-auto max-w-7xl px-3 py-16 sm:px-6 sm:py-20 ${
        withTopBorder ? "border-t border-border" : ""
      }`}
    >
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4 sm:mb-12">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {eyebrow}
          </p>
          <h2 className="text-4xl font-bold tracking-tighter md:text-6xl">{title}</h2>
        </div>
        <Link
          href={seeAllHref}
          className="hidden sm:inline-block rounded-full border border-border px-5 py-2 text-sm font-medium transition hover:border-foreground/35"
        >
          See all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-5">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={`${id}-${product.slug}`} product={product} />
        ))}
      </div>

      <div className="mt-8 flex justify-center sm:hidden">
        <Link
          href={seeAllHref}
          className="w-full text-center rounded-full border border-border px-5 py-2.5 text-sm font-medium transition hover:border-foreground/35 bg-card"
        >
          See all
        </Link>
      </div>
    </section>
  );
}

export default async function Home() {
  const [products, collections] = await Promise.all([getProducts(), getCollections()]);
  const coverProducts = products.filter((product) => product.categorySlug === "covers-cases");
  const temperedGlassProducts = products.filter(
    (product) => product.categorySlug === "tempered-glass",
  );
  const otherProducts = products.filter(
    (product) =>
      product.categorySlug !== "covers-cases" && product.categorySlug !== "tempered-glass",
  );
  const homeJsonLd = [
    organizationJsonLd(),
    websiteJsonLd(),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Best iPhone covers and cases from The iPhone Project",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(productPath(product)),
        item: productJsonLd(product),
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <JsonLd data={homeJsonLd} />
      <section className="overflow-hidden bg-black text-white -mt-[68px] pt-[68px] md:-mt-[76px] md:pt-[76px]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 px-4 py-6 lg:min-h-0 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-8 lg:px-6 lg:pb-8 lg:pt-6">
          <div className="relative order-1 mx-auto aspect-square w-full max-w-[500px] overflow-hidden rounded-none lg:order-2">
            <Image
              src={heroImg}
              alt="iPhone wearing a cover from The iPhone Project"
              fill
              priority
              sizes="(min-width: 1024px) 500px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25 lg:bg-gradient-to-l lg:from-transparent lg:to-black/20" />
          </div>

          <div className="order-2 flex flex-col justify-center px-1 py-5 sm:px-6 sm:py-10 lg:order-1 lg:px-6 lg:pt-0 lg:pb-8">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/60 sm:text-xs">
              New - Frosted Air Series
            </p>
            <h1 className="max-w-2xl text-4xl font-bold leading-[0.92] sm:text-5xl md:text-7xl lg:text-8xl">
              Covers & cases for iPhone
            </h1>
            <p className="mt-4 max-w-xl text-base font-light leading-7 text-white/75 sm:text-lg md:mt-6 md:text-xl">
              Shop premium iPhone covers and MagSafe cases in India, built for slim everyday
              protection, clean colours, free shipping, COD, and 7-day returns.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 md:mt-10">
              <Link
                href="#shop"
                className="w-full rounded-full bg-white px-8 py-3 text-center text-sm font-medium uppercase tracking-[0.08em] text-black transition hover:bg-white/90 sm:w-auto md:px-10"
              >
                Shop
              </Link>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 md:mt-16 md:gap-6">
              {[
                ["50k+", "Happy customers"],
                ["4.9", "Avg. rating"],
                ["27k+", "Pin codes"],
              ].map(([number, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold md:text-3xl">{number}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-white/50 md:text-[11px]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-neutral-900 bg-black py-4">
        <div
          className="flex animate-[scroll_40s_linear_infinite] items-center gap-8 whitespace-nowrap text-[11px] uppercase tracking-[0.25em] text-neutral-300"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {Array.from({ length: 4 }).map((_, group) => (
            <div key={group} className="flex shrink-0 items-center gap-8">
              {[
                "Designed in Bengaluru",
                "Drop-tested 3m",
                "MagSafe ready",
                "22g featherlight",
                "Free India shipping",
                "7-day returns",
              ].map((text) => (
                <div key={`${group}-${text}`} className="flex items-center gap-8">
                  <span>{text}</span>
                  <span className="text-[#ff5500] font-extrabold select-none">•</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section id="models" className="border-b border-border">
        <div className="mx-auto max-w-7xl px-3 py-10 sm:py-20 text-center sm:px-6">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Compatibility
          </p>
          <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Find your fit.</h2>
          <ModelFitSelector />
        </div>
      </section>

      <ProductGridSection
        id="shop"
        eyebrow="The Line-up"
        title="Shop covers."
        products={coverProducts}
        seeAllHref="/category/covers-cases"
      />

      <ProductGridSection
        id="tempered-glass"
        eyebrow="Screen Protection"
        title="Tempered glass."
        products={temperedGlassProducts}
        seeAllHref="/category/tempered-glass"
        withTopBorder
      />

      <ProductGridSection
        id="others"
        eyebrow="Power, Wallets & Extras"
        title="Others."
        products={otherProducts}
        seeAllHref="/category/accessories"
        withTopBorder
      />

      <section
        id="combos"
        className="mx-auto grid max-w-7xl gap-3 border-t border-border px-3 py-16 sm:grid-cols-2 sm:px-6 sm:py-20"
      >
        <div className="rounded-2xl border border-border bg-card p-6 sm:rounded-3xl sm:p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">Combos</p>
          <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Case + glass bundles.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            Build a daily protection set with a cover, tempered glass, and camera protection for
            your exact iPhone model.
          </p>
          <Link
            href="/combos"
            className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
          >
            Shop combos
          </Link>
        </div>
        <div
          id="offers"
          className="rounded-2xl border border-border bg-card p-6 sm:rounded-3xl sm:p-8"
        >
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">Offers</p>
          <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">Launch deals.</h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
            Free shipping across India, COD support, and limited bundle pricing while launch stock
            lasts.
          </p>
          <Link
            href="/offers"
            className="mt-6 inline-flex rounded-full bg-[#ff5500] px-5 py-2.5 text-sm font-medium text-white"
          >
            View offers
          </Link>
        </div>
      </section>

      <section
        id="collections"
        className="mx-auto max-w-7xl border-t border-border px-3 py-24 sm:px-6"
      >
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Collections
          </p>
          <h2 className="text-4xl font-bold tracking-tighter md:text-6xl">
            Four ways to dress it.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {collections.map((collection, index) => (
            <Link
              href={`/collections/${collection.slug}`}
              key={collection.title}
              className="flex min-h-[210px] flex-col justify-between rounded-2xl p-5 ring-1 ring-border transition hover:ring-foreground/30 sm:min-h-[280px] sm:rounded-3xl sm:p-8"
              style={{
                background: [
                  "linear-gradient(160deg, var(--orange-tint), oklch(0.97 0.01 50))",
                  "linear-gradient(160deg, oklch(0.85 0.04 50), oklch(0.95 0.02 30))",
                  "linear-gradient(160deg, var(--blue-tint), oklch(0.97 0.01 230))",
                  "linear-gradient(160deg, var(--purple-tint), var(--pink-tint))",
                ][index],
              }}
            >
              <p className="text-[10px] uppercase tracking-wider text-foreground/60 sm:text-[11px]">
                {collection.count}
              </p>
              <div>
                <h3 className="text-lg font-bold tracking-tighter sm:text-2xl">
                  {collection.title}
                </h3>
                <p className="mt-1.5 text-xs text-foreground/70 sm:text-sm">{collection.desc}</p>
                <p className="mt-4 text-xs font-medium">Explore</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="story" className="px-3 pb-6 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-6">
          <div
            className="flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl p-5 sm:min-h-[420px] sm:rounded-4xl sm:p-10 md:p-14"
            style={{
              background: "linear-gradient(160deg, var(--orange-tint), oklch(0.95 0.02 50))",
            }}
          >
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-foreground/60 sm:mb-3 sm:text-xs">
              Drop tested
            </p>
            <h3 className="max-w-md text-xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              3 metres. Concrete. <span className="text-foreground/50">No drama.</span>
            </h3>
            <p className="mt-3 max-w-md text-xs font-light leading-5 text-foreground/70 sm:mt-4 sm:text-base md:text-lg">
              Air-cushion corners absorb every fall so your iPhone keeps its glow.
            </p>
          </div>
          <div
            className="flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl p-5 sm:min-h-[420px] sm:rounded-4xl sm:p-10 md:p-14"
            style={{
              background: "linear-gradient(160deg, var(--blue-tint), oklch(0.96 0.01 230))",
            }}
          >
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-foreground/60 sm:mb-3 sm:text-xs">
              MagSafe ready
            </p>
            <h3 className="max-w-md text-xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Snaps on. <span className="text-foreground/50">Charges through.</span>
            </h3>
            <p className="mt-3 max-w-md text-xs font-light leading-5 text-foreground/70 sm:mt-4 sm:text-base md:text-lg">
              Precision magnets keep wallets, chargers, stands, and mounts aligned.
            </p>
          </div>
          <div className="col-span-2 flex min-h-[220px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-foreground p-6 text-center text-background sm:min-h-[360px] sm:rounded-4xl sm:p-10 md:p-14">
            <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-background/60 sm:mb-3 sm:text-xs">
              Featherlight
            </p>
            <h3 className="max-w-2xl text-3xl font-bold tracking-tighter sm:text-4xl md:text-6xl">
              Just 22 grams.{" "}
              <span className="text-background/50">You will forget it is there.</span>
            </h3>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-24 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">Compare</p>
          <h2 className="text-4xl font-bold tracking-tighter md:text-5xl">Pick your shield.</h2>
        </div>
        <div className="overflow-x-auto rounded-3xl ring-1 ring-border">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["", "Frosted Air", "Leather", "Clear Shield"].map((heading) => (
                  <th
                    key={heading}
                    className="p-5 text-left text-xs font-bold uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Weight", "22g", "38g", "26g"],
                ["Drop protection", "3m", "2m", "2.5m"],
                ["MagSafe", "Yes", "Yes", "Yes"],
                ["Anti-yellowing", "Yes", "No", "Yes"],
                ["Price from", "Rs. 1,299", "Rs. 2,499", "Rs. 999"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-border">
                  {row.map((cell, index) => (
                    <td
                      key={`${row[0]}-${index}-${cell}`}
                      className={`p-5 ${index === 0 ? "font-medium text-muted-foreground" : ""}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-3 py-24 sm:px-6">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Loved across India
            </p>
            <h2 className="text-4xl font-bold tracking-tighter md:text-5xl">
              4.9 / 5 from 1,247 reviews
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.name} className="rounded-3xl bg-background p-7 ring-1 ring-border">
                <div className="text-sm text-accent">{"★".repeat(review.rating)}</div>
                <p className="mt-4 text-base leading-relaxed">"{review.text}"</p>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-bold">{review.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Verified buyer</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl border-t border-border px-3 py-24 sm:px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">FAQ</p>
          <h2 className="text-4xl font-bold tracking-tighter md:text-5xl">Good to know.</h2>
        </div>
        <div className="space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group rounded-2xl bg-card p-6 ring-1 ring-border">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-sm font-medium leading-6 text-foreground md:text-base">
                {question}
                <span className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-3 py-12 text-center sm:px-6 md:grid-cols-4">
          {[
            ["Free shipping", "Across India"],
            ["COD available", "On every order"],
            ["7-day returns", "No questions"],
            ["Made in India", "Designed in Bengaluru"],
          ].map(([title, subtitle]) => (
            <div key={title}>
              <p className="text-sm font-bold">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-28 text-center sm:px-6">
        <h2 className="text-5xl font-bold tracking-tighter md:text-7xl">
          Dress your iPhone.
          <br />
          <span className="text-muted-foreground">Today.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-base text-muted-foreground">
          Join 50,000+ customers getting drop alerts and 10% off their first order.
        </p>
        <form className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            type="email"
            placeholder="you@email.com"
            className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-foreground/40"
          />
          <button
            type="submit"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
          >
            Notify me
          </button>
        </form>
      </section>
    </main>
  );
}
