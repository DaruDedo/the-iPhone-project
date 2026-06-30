"use client";

import Link from "next/link";
import {
  BarChart3,
  Boxes,
  Download,
  MessageSquareText,
  PackageCheck,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";

const adminCards = [
  {
    title: "Products",
    desc: "Add products, upload images, assign iPhone models, edit stock, and publish items.",
    href: "/admin/products",
    icon: Boxes,
  },
  {
    title: "Orders & tracking",
    desc: "See new orders, update status, and track fulfilment from packed to delivered.",
    href: "/admin/orders",
    icon: PackageCheck,
  },
  {
    title: "AI Visibility",
    desc: "Track discoverability, bot referrals, shopper search intent, and SEO completeness.",
    href: "/admin/ai-visibility",
    icon: Sparkles,
  },
  {
    title: "Reviews",
    desc: "Collect, approve, and manage product reviews for better trust and AI visibility.",
    href: "/admin/reviews",
    icon: MessageSquareText,
  },
  {
    title: "Checkouts",
    desc: "Monitor real-time keystrokes, form entries, and drop-off exit stages of shoppers.",
    href: "/admin/checkouts",
    icon: ShoppingCart,
  },
  {
    title: "Leads",
    desc: "View cart leads, coupon leads, checkout drafts, and source tracking events.",
    href: "/admin/leads",
    icon: Users,
  },
  {
    title: "Cart activity",
    desc: "View live cart additions, item quantities, and selected phone models.",
    href: "/admin/cart-activity",
    icon: ShoppingCart,
  },
  {
    title: "Templates",
    desc: "Copy WhatsApp and support messages for orders, payment, tracking, and fit questions.",
    href: "/admin/templates",
    icon: MessageSquareText,
  },
  {
    title: "Data export",
    desc: "Open product feeds, sitemap, AI catalog, order panels, and lead data.",
    href: "/admin/export",
    icon: Download,
  },
  {
    title: "Analytics",
    desc: "Watch product clicks, sales, search intent, and popular iPhone model demand.",
    href: "/admin/settings",
    icon: BarChart3,
  },
  {
    title: "Store settings",
    desc: "Configure shipping, payment labels, SEO defaults, support details, and media storage.",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-background px-3 py-10 text-foreground sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-4xl font-bold md:text-6xl">Dashboard.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Manage the store from focused panels instead of one crowded screen.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
          >
            Store
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {adminCards.map(({ title, desc, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-3xl border border-border bg-card p-6 transition hover:-translate-y-0.5 hover:border-foreground/35"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground">
                <Icon className="size-5" />
              </div>
              <h2 className="mt-5 text-2xl font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground hidden md:block">{desc}</p>
              <p className="mt-5 text-sm font-medium">Open panel</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
