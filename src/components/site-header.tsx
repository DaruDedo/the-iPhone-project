"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  Tag,
  User,
  X,
  ChevronRight,
  Package,
  Truck,
  Headphones,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart-provider";

// Static case images imports
import caseBlue from "@/assets/case-blue.jpg";
import caseOrange from "@/assets/case-orange.jpg";
import casePink from "@/assets/case-pink.jpg";

const primaryMenuLinks = [
  { href: "/#shop", label: "Shop" },
  { href: "/#collections", label: "Collections" },
  { href: "/#models", label: "Compatibility" },
  { href: "/blog", label: "Journal" },
  { href: "/#support", label: "Support" },
];

const categoryLinks = [
  { href: "/#shop", label: "All products" },
  { href: "/category/covers-cases", label: "Covers & Cases" },
  { href: "/category/tempered-glass", label: "Tempered Glass" },
  { href: "/category/camera-protection", label: "Camera Protection" },
  { href: "/category/magsafe-wallets", label: "MagSafe Wallets" },
  { href: "/category/accessories", label: "Accessories" },
];

const shopMenuGroups = [
  {
    title: "Products",
    links: [
      { href: "/category/covers-cases", label: "Covers & Cases" },
      { href: "/category/tempered-glass", label: "Tempered Glass" },
      { href: "/category/camera-protection", label: "Camera Protection" },
      { href: "/category/magsafe-wallets", label: "MagSafe Wallets" },
      { href: "/category/accessories", label: "Accessories" },
      { href: "/#shop", label: "All Products" },
    ],
  },
  {
    title: "Popular iPhones",
    links: [
      { href: "/iphone/iphone-17-pro-max", label: "iPhone 17 Pro Max" },
      { href: "/iphone/iphone-17-pro", label: "iPhone 17 Pro" },
      { href: "/iphone/iphone-17", label: "iPhone 17" },
      { href: "/iphone/iphone-16-pro-max", label: "iPhone 16 Pro Max" },
      { href: "/iphone/iphone-16-pro", label: "iPhone 16 Pro" },
      { href: "/iphone/iphone-15", label: "iPhone 15" },
    ],
  },
  {
    title: "Shop Smart",
    links: [
      { href: "/combos", label: "Combos" },
      { href: "/offers", label: "Offers" },
      { href: "/track-order", label: "Track Order" },
      { href: "/#models", label: "Find Your Fit" },
      { href: "/search", label: "Search Store" },
    ],
  },
];

const announcement = "Free shipping across India above ₹499";

function BrandMark({ className = "" }: { className?: string }) {
  return <span className={`font-bold tracking-tight ${className}`}>The iPhone Project</span>;
}

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [floatingOverPage, setFloatingOverPage] = useState(false);
  const shopCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { itemCount, openCart } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const updateHeaderSurface = () => {
      setFloatingOverPage(window.scrollY > 80);
    };

    updateHeaderSurface();
    window.addEventListener("scroll", updateHeaderSurface, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderSurface);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function goToSearch() {
    const query = searchQuery.trim();
    if (query) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  }

  function openShopMenu() {
    if (shopCloseTimer.current) {
      clearTimeout(shopCloseTimer.current);
      shopCloseTimer.current = null;
    }
    setShopOpen(true);
  }

  function scheduleShopClose() {
    if (shopCloseTimer.current) {
      clearTimeout(shopCloseTimer.current);
    }
    shopCloseTimer.current = setTimeout(() => {
      setShopOpen(false);
      shopCloseTimer.current = null;
    }, 500);
  }

  return (
    <>
      <style>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="h-6 overflow-hidden bg-foreground text-[10px] uppercase tracking-[0.22em] text-background"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <div className="flex h-full animate-[scroll_24s_linear_infinite] items-center gap-8 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, index) => (
            <span key={index} className="shrink-0">
              {announcement}
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full pb-3 bg-transparent">
        <div className="relative mx-auto hidden h-16 w-[calc(100%-2.5rem)] max-w-7xl items-center justify-between rounded-b-[2rem] rounded-t-none border border-white/45 border-t-0 bg-white/70 px-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-18px_42px_rgba(255,255,255,0.25),0_18px_55px_rgba(0,0,0,0.08),0_0_34px_rgba(255,255,255,0.5)] backdrop-blur-2xl transition-all duration-500 before:absolute before:inset-0 before:rounded-b-[2rem] before:bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.95),transparent_34%),radial-gradient(circle_at_88%_100%,rgba(255,255,255,0.4),transparent_32%)] before:opacity-85 after:absolute after:inset-x-8 after:top-0 after:h-px after:bg-white/95 hover:bg-white/78 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-18px_42px_rgba(255,255,255,0.3),0_22px_70px_rgba(0,0,0,0.12),0_0_42px_rgba(255,255,255,0.6)] md:flex">
          <div className="pointer-events-none absolute bottom-0 left-8 right-8 z-0 h-px bg-gradient-to-r from-[#ff5500]/20 via-[#ff5500]/65 to-[#ff5500]/20 blur-[0.5px]" />

          <div className="relative z-10 flex shrink-0 items-center justify-center rounded-2xl border border-white/55 bg-white/30 px-5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_22px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            <Link
              href="/"
              className="select-none text-[13px]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <BrandMark />
            </Link>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-muted-foreground">
            <div className="relative" onMouseEnter={openShopMenu} onMouseLeave={scheduleShopClose}>
              <button
                onClick={() => (shopOpen ? scheduleShopClose() : openShopMenu())}
                className={`relative flex items-center gap-1.5 rounded-full border px-6 py-2 text-[12px] uppercase tracking-[0.03em] transition-all duration-300 focus:outline-none ${
                  shopOpen
                    ? "border-white/65 bg-white/55 font-semibold text-neutral-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_22px_rgba(0,0,0,0.08)]"
                    : "border-transparent font-medium text-neutral-950/68 hover:border-white/45 hover:bg-white/35 hover:text-neutral-950"
                }`}
              >
                <ShoppingBag size={13} />
                <span>Shop</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-300 ${shopOpen ? "rotate-180 text-[#ff5500]" : ""}`}
                />
              </button>

              {shopOpen && (
                <div className="pointer-events-auto fixed left-1/2 top-[3.72rem] z-50 w-[min(920px,calc(100vw-3rem))] -translate-x-1/2 pt-0">
                  <div className="h-1 w-full" />
                  <div
                    onMouseEnter={openShopMenu}
                    onMouseLeave={scheduleShopClose}
                    className="grid grid-cols-3 gap-4 rounded-[1.8rem] border border-white/60 bg-white/96 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_28px_70px_rgba(0,0,0,0.24),0_0_42px_rgba(255,85,0,0.16)] backdrop-blur-2xl"
                  >
                    {shopMenuGroups.map((group) => (
                      <div key={group.title}>
                        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
                          {group.title}
                        </p>
                        <div className="space-y-1">
                          {group.links.map((item) => (
                            <Link
                              key={`${group.title}-${item.href}`}
                              href={item.href}
                              onClick={() => setShopOpen(false)}
                              className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground/72 transition hover:bg-white/58 hover:text-foreground hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                            >
                              <span>{item.label}</span>
                              <ChevronDown className="-rotate-90 text-[#ff5500]/70" size={13} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    <Link
                      href="/#shop"
                      onClick={() => setShopOpen(false)}
                      className="col-span-3 flex items-center justify-between rounded-2xl bg-[#ff5500] px-4 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_12px_28px_rgba(255,85,0,0.28)] transition hover:bg-[#ff6a1f]"
                    >
                      <span>See every product</span>
                      <ShoppingBag size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/combos"
              className="rounded-full border border-transparent px-5 py-2 text-[12px] font-medium uppercase tracking-[0.03em] text-neutral-950/68 transition-all duration-300 hover:border-white/45 hover:bg-white/35 hover:text-neutral-950"
            >
              Combos
            </Link>
            <Link
              href="/offers"
              className={`relative flex items-center gap-1.5 rounded-full border px-5 py-2 text-[12px] uppercase tracking-[0.03em] transition-all duration-300 ${
                pathname === "/offers"
                  ? "border-white/65 bg-white/55 font-semibold text-[#f05a1b]"
                  : "border-transparent font-medium text-neutral-950/68 hover:border-white/45 hover:bg-white/35 hover:text-neutral-950"
              }`}
            >
              <Tag size={13} />
              Offers
            </Link>
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-2">
            <button
              onClick={() => setDesktopSearchOpen(!desktopSearchOpen)}
              className={`grid size-9 place-items-center rounded-full border transition-all focus:outline-none shadow-sm ${
                desktopSearchOpen
                  ? "border-[#ff5500]/30 bg-[#ff5500]/15 text-[#ff5500] shadow-[0_0_8px_rgba(255,85,0,0.1)]"
                  : "border-white/80 bg-white text-foreground hover:bg-neutral-50 hover:border-white"
              }`}
            >
              <Search size={15} />
            </button>
            <div className="mx-1 h-5 w-px bg-white/45 shadow-[1px_0_0_rgba(0,0,0,0.08)]" />
            <Link
              href="/admin"
              className="grid size-9 place-items-center rounded-full border border-white/80 bg-white text-foreground transition-all hover:bg-neutral-50 hover:border-white shadow-sm"
            >
              <User size={15} />
            </Link>
            <button
              data-testid="open-cart"
              onClick={openCart}
              className="flex h-9 items-center gap-1.5 rounded-full px-4 text-[12px] font-semibold text-[#ff5500] border border-[#ff5500] bg-white transition-all duration-300 hover:bg-[#ff5500]/5 hover:shadow-[0_0_12px_rgba(255,85,0,0.15)] focus:outline-none font-sans"
            >
              <ShoppingBag size={13} className="shrink-0 text-[#ff5500]" />
              <span className="leading-none">Bag</span>
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ff5500] text-[10px] font-bold text-white leading-none pt-[0.5px]">
                {itemCount}
              </span>
            </button>
          </div>

          {desktopSearchOpen && (
            <div className="pointer-events-auto absolute left-1/2 top-[115%] z-50 w-[480px] -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/96 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search products, categories, collections..."
                    className="h-10 w-full rounded-xl border border-transparent bg-black/[0.02] pl-9 pr-4 text-[12px] text-foreground transition-all focus:border-black/10 focus:bg-white focus:outline-none"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        goToSearch();
                      }
                    }}
                  />
                </div>
                <button
                  onClick={goToSearch}
                  className="h-10 rounded-xl bg-foreground px-4 text-[11px] font-bold uppercase text-background transition-all hover:bg-foreground/90"
                >
                  Search
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative mx-auto flex h-14 w-[calc(100%-1.25rem)] items-center justify-between overflow-hidden rounded-b-2xl rounded-t-none border border-white/45 border-t-0 bg-white/72 px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_38px_rgba(0,0,0,0.08),0_0_24px_rgba(255,255,255,0.4)] backdrop-blur-2xl before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.95),transparent_38%),radial-gradient(circle_at_90%_100%,rgba(255,255,255,0.4),transparent_34%)] before:opacity-85 md:hidden">
          <div className="pointer-events-none absolute bottom-0 left-4 right-4 z-0 h-px bg-gradient-to-r from-[#ff5500]/20 via-[#ff5500]/60 to-[#ff5500]/20 blur-[0.5px]" />
          <button
            aria-label="Open navigation"
            className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-white/60 bg-white/38 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_8px_18px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all hover:bg-white/55 focus:outline-none"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={16} />
          </button>
          <Link
            href="/"
            className="relative z-10 select-none whitespace-nowrap text-[13px] font-bold tracking-tight"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <BrandMark />
          </Link>
          <button
            onClick={openCart}
            className="relative z-10 flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#ff5500] bg-white px-3.5 text-[12px] font-semibold text-[#ff5500] shadow-sm transition-all hover:bg-[#ff5500]/5 focus:outline-none font-sans"
          >
            <ShoppingBag size={12} className="shrink-0 text-[#ff5500]" />
            <span className="max-[370px]:hidden leading-none">Bag</span>
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ff5500] text-[10px] font-bold text-white leading-none pt-[0.5px]">
              {itemCount}
            </span>
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[100] flex flex-col justify-between bg-white transition-all duration-300 md:hidden ${
          mobileOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex h-14 items-center justify-between border-b border-border/40 px-6 shrink-0">
          <span
            className="text-[15px] font-bold tracking-tight text-foreground"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            THE<span className="text-[#ff5500]">.I</span>PHONE
            <span className="text-[#ff5500]">.</span>PROJECT
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              aria-label="Toggle search"
              className={`grid size-9 place-items-center rounded-full border transition-all focus:outline-none ${
                showSearch
                  ? "border-[#ff5500] text-[#ff5500] bg-[#ff5500]/5"
                  : "border-border text-foreground hover:bg-secondary/40"
              }`}
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-full border border-border text-foreground hover:bg-secondary/40 focus:outline-none"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-6 py-3 shrink-0 border-b border-border/20">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-muted-foreground">
                <Search size={16} />
              </span>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, collections..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary/80 border border-transparent text-[13px] text-foreground placeholder-muted-foreground focus:outline-none focus:bg-background focus:border-border transition-all"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    goToSearch();
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Primary Navigation Links */}
          <div className="space-y-0.5">
            {primaryMenuLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center justify-between py-3 border-b border-border/30 text-sm font-bold text-foreground hover:text-muted-foreground transition-all"
              >
                <span>{link.label}</span>
                <ChevronRight size={14} className="text-muted-foreground/80" />
              </Link>
            ))}
          </div>

          {/* Explore Collections Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/90">
              Explore Collections
            </p>
            <div className="grid grid-cols-2 gap-3">
              {/* Frosted Air */}
              <Link
                href="/collections/frosted-air"
                onClick={closeMobileMenu}
                className="relative flex h-20 items-center overflow-hidden rounded-2xl bg-[#FFF6F0] p-4 text-xs font-semibold text-foreground transition-all hover:opacity-90"
              >
                <div className="flex flex-col justify-center gap-1 z-10">
                  <span className="flex items-center gap-1 font-extrabold text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff5500]" />
                    Frosted Air
                  </span>
                </div>
                <div className="absolute -right-3 -bottom-4 w-14 h-20 flex items-center justify-center">
                  <Image
                    src={caseOrange}
                    alt="Frosted Air"
                    width={56}
                    height={80}
                    className="h-20 w-auto object-contain rotate-12 transform scale-125 select-none pointer-events-none"
                  />
                </div>
              </Link>

              {/* Leather Edition */}
              <Link
                href="/collections/leather-edition"
                onClick={closeMobileMenu}
                className="relative flex h-20 items-center overflow-hidden rounded-2xl bg-[#F6F1EC] p-4 text-xs font-semibold text-foreground transition-all hover:opacity-90"
              >
                <div className="flex flex-col justify-center z-10">
                  <span className="font-extrabold text-foreground">Leather Edition</span>
                </div>
                <div className="absolute -right-3 -bottom-4 w-14 h-20 flex items-center justify-center">
                  <Image
                    src={casePink}
                    alt="Leather Edition"
                    width={56}
                    height={80}
                    className="h-20 w-auto object-contain rotate-12 transform scale-125 select-none pointer-events-none"
                  />
                </div>
              </Link>

              {/* Clear Shield */}
              <Link
                href="/collections/clear-shield"
                onClick={closeMobileMenu}
                className="relative flex h-20 items-center overflow-hidden rounded-2xl bg-[#F0F6FC] p-4 text-xs font-semibold text-foreground transition-all hover:opacity-90"
              >
                <div className="flex flex-col justify-center z-10">
                  <span className="font-extrabold text-foreground">Clear Shield</span>
                </div>
                <div className="absolute -right-3 -bottom-4 w-14 h-20 flex items-center justify-center">
                  <Image
                    src={caseBlue}
                    alt="Clear Shield"
                    width={56}
                    height={80}
                    className="h-20 w-auto object-contain rotate-12 transform scale-125 select-none pointer-events-none"
                  />
                </div>
              </Link>

              {/* Kavach Studio */}
              <Link
                href="/blog"
                onClick={closeMobileMenu}
                className="relative flex h-20 items-center overflow-hidden rounded-2xl bg-[#FAF0FC] p-4 text-xs font-semibold text-foreground transition-all hover:opacity-90"
              >
                <div className="flex flex-col justify-center z-10">
                  <span className="font-extrabold text-foreground">Kavach Studio</span>
                </div>
                <div className="absolute right-4 bottom-3 text-3xl font-extrabold text-[#A855F7]/40 font-display select-none">
                  K
                </div>
              </Link>
            </div>
          </div>

          {/* Shop by iPhone Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/90">
              Shop by iPhone
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "iPhone 17 Pro Max",
                "iPhone 17 Pro",
                "iPhone 17",
                "iPhone 16 Pro Max",
                "iPhone 16 Pro",
                "iPhone 16",
                "iPhone 15",
              ].map((model) => (
                <Link
                  key={model}
                  href={`/iphone/${model.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={closeMobileMenu}
                  className="flex h-9 items-center justify-center rounded-full border border-border bg-background text-[11px] font-bold text-foreground transition-all hover:border-foreground/30"
                >
                  {model}
                </Link>
              ))}
            </div>
          </div>

          {/* Feature Card/Banner Section */}
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-[#FFF6F0] p-4 flex gap-4">
            <div className="w-1/3 flex items-center justify-center">
              <Image
                src={caseOrange}
                alt="Frosted Air Cover"
                width={80}
                height={80}
                className="h-20 w-auto object-contain rotate-6 select-none pointer-events-none"
              />
            </div>
            <div className="flex-1 flex flex-col justify-center items-start">
              <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-[#ff5500]">
                New • Frosted Air
              </span>
              <h3 className="mt-0.5 text-xs font-extrabold text-foreground leading-snug">
                Featherlight. Built for everyday impact.
              </h3>
              <Link
                href="/collections/frosted-air"
                onClick={closeMobileMenu}
                className="mt-2 inline-flex h-7 items-center justify-center rounded-full bg-foreground px-3 text-[10px] font-bold text-background transition-all hover:opacity-90"
              >
                Shop now <span className="ml-1 text-[9px]">→</span>
              </Link>
            </div>
          </div>

          {/* Utility/Support Links */}
          <div className="space-y-0.5 border-t border-border/30 pt-4">
            <Link
              href="/track-order"
              onClick={closeMobileMenu}
              className="flex items-center justify-between py-2.5 text-xs font-semibold text-foreground hover:text-muted-foreground transition-all"
            >
              <div className="flex items-center gap-3">
                <Package size={15} className="text-muted-foreground" />
                <span>Track order</span>
              </div>
              <ChevronRight size={13} className="text-muted-foreground" />
            </Link>

            <Link
              href="/shipping"
              onClick={closeMobileMenu}
              className="flex items-center justify-between py-2.5 text-xs font-semibold text-foreground hover:text-muted-foreground transition-all"
            >
              <div className="flex items-center gap-3">
                <Truck size={15} className="text-muted-foreground" />
                <span>Shipping & Returns</span>
              </div>
              <ChevronRight size={13} className="text-muted-foreground" />
            </Link>

            <Link
              href="/contact"
              onClick={closeMobileMenu}
              className="flex items-center justify-between py-2.5 text-xs font-semibold text-foreground hover:text-muted-foreground transition-all"
            >
              <div className="flex items-center gap-3">
                <Headphones size={15} className="text-muted-foreground" />
                <span>Contact us</span>
              </div>
              <ChevronRight size={13} className="text-muted-foreground" />
            </Link>
          </div>
        </div>

        {/* Bottom Sticky CTA Bar */}
        <div className="border-t border-border/40 bg-background px-6 pt-4 pb-2 shrink-0">
          <button
            className="w-full flex h-11 items-center justify-center gap-2 rounded-full border border-[#ff5500] bg-white text-[12px] font-semibold text-[#ff5500] hover:bg-[#ff5500]/5 transition shadow-sm font-sans"
            onClick={() => {
              setMobileOpen(false);
              openCart();
            }}
          >
            <ShoppingBag size={14} className="shrink-0 text-[#ff5500]" />
            <span className="leading-none">View Bag</span>
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ff5500] text-[10px] font-bold text-white leading-none pt-[0.5px]">
              {itemCount}
            </span>
          </button>

          {/* Footer Badges */}
          <div className="flex justify-center items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-muted-foreground/80 pt-3 pb-1">
            <span>Free shipping across India</span>
            <span className="text-muted-foreground/30">•</span>
            <span>COD available</span>
            <span className="text-muted-foreground/30">•</span>
            <span>7-day returns</span>
          </div>
        </div>
      </div>
    </>
  );
}
