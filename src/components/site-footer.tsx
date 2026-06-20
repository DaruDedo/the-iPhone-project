import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer id="support" className="border-t border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-12 text-sm md:grid-cols-4">
        <div>
          <p className="mb-3 font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            The iPhone Project
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Premium iPhone covers, designed in Bengaluru and shipped across India.
          </p>
        </div>
        <div>
          <p className="mb-3 font-bold">Shop</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link href="/shop">All products</Link>
            </li>
            <li>
              <Link href="/category/covers-cases">Covers & Cases</Link>
            </li>
            <li>
              <Link href="/category/tempered-glass">Tempered Glass</Link>
            </li>
            <li>
              <Link href="/category/camera-protection">Camera Protection</Link>
            </li>
            <li>
              <Link href="/category/magsafe-wallets">MagSafe Wallets</Link>
            </li>
            <li>
              <Link href="/category/accessories">Accessories</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-bold">Support</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            </li>
            {siteConfig.phone && (
              <li>
                <a href={`tel:${siteConfig.phone.replace(/[^+\d]/g, "")}`}>{siteConfig.phone}</a>
              </li>
            )}
            <li>
              <Link href="/shipping">Shipping</Link>
            </li>
            <li>
              <Link href="/returns">Return/refund policy</Link>
            </li>
            <li>
              <Link href="/warranty">Warranty policy</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-bold">Company</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>
              <Link href="/privacy">Privacy policy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>{siteConfig.businessAddress}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <p>(c) 2026 The iPhone Project. Prices are in INR and inclusive of GST.</p>
          <p>India</p>
        </div>
      </div>
    </footer>
  );
}
