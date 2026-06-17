import Link from "next/link";

const exports = [
  {
    title: "Product feed XML",
    href: "/product-feed.xml",
    text: "Google Merchant-style product feed with product URL, image, price, brand, and model label.",
  },
  {
    title: "Sitemap XML",
    href: "/sitemap.xml",
    text: "All public pages for Google discovery.",
  },
  {
    title: "AI catalog",
    href: "/llms-full.txt",
    text: "Full AI-readable category, model, and product catalog.",
  },
  {
    title: "Orders panel",
    href: "/admin/orders",
    text: "Export manually from browser until CSV export is added.",
  },
  {
    title: "Leads panel",
    href: "/admin/leads",
    text: "Cart leads, checkout drafts, coupon leads, and behavior events.",
  },
];

export default function AdminExportPage() {
  return (
    <main className="min-h-screen bg-background px-3 py-10 text-foreground sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-4xl font-bold md:text-6xl">Data export.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Export and discovery endpoints for product data, AI visibility, orders, and leads.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {exports.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-foreground/35"
            >
              <h2 className="text-2xl font-bold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
              <p className="mt-6 text-sm font-medium">Open</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
