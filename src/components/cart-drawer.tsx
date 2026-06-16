"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { getCartItemKey, useCart } from "@/components/cart-provider";
import { formatPrice, products } from "@/data/products";

const COUPONS = [
  { code: "TIP100", discount: 100, desc: "Rs 100 off above Rs 999" },
  { code: "TIP300", discount: 300, desc: "Rs 300 off above Rs 1999" },
];

export function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, updateQuantity, removeItem, addItem } = useCart();
  const [showTotalsDetails, setShowTotalsDetails] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string>("TIP300");
  const [couponInput, setCouponInput] = useState<string>("");

  const activeCoupon = COUPONS.find((c) => c.code === appliedCoupon);
  const discountAmount = activeCoupon ? activeCoupon.discount : 0;

  // Find the wallet product for the add-on card
  const walletProduct = products.find((p) => p.slug === "snap-magsafe-wallet");
  const hasWallet = items.some((item) => item.slug === "snap-magsafe-wallet");

  // Determine item count
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {isOpen && (
        <button
          aria-label="Close cart overlay"
          className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={closeCart}
        />
      )}
      <aside
        data-testid="cart-drawer"
        className={`fixed right-0 top-0 z-[90] flex h-dvh w-full max-w-md flex-col bg-[#FAF9F6] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Header Section */}
        <div className="flex h-16 flex-col justify-center border-b border-border/40 bg-background px-3.5 shrink-0 relative">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-extrabold tracking-tight uppercase text-foreground leading-none">
              Your Bag
            </h2>
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="grid size-8 place-items-center rounded-full border border-border text-foreground hover:opacity-80 transition-opacity focus:outline-none"
            >
              <X size={14} />
            </button>
          </div>
          <p className="mt-1 text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase flex items-center gap-1.5">
            {String(itemCount).padStart(2, "0")} Items <span className="text-[#ff5500]">•</span>{" "}
            Ready To Ship
          </p>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3.5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="grid size-14 place-items-center rounded-full bg-muted">
                <ShoppingBag size={22} />
              </div>
              <h2 className="mt-5 text-2xl font-bold">Your bag is empty.</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                Add a cover and it will wait here while you keep browsing.
              </p>
              <button
                className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
                onClick={closeCart}
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-3.5">
                {items.map((item, index) => {
                  const key = getCartItemKey(item);
                  const indexStr = String(index + 1).padStart(2, "0");
                  return (
                    <article
                      key={key}
                      className="relative flex gap-2 rounded-[16px] border border-border/60 bg-background p-3 shadow-sm"
                    >
                      {/* Left vertical index/stepper styling */}
                      <div className="flex flex-col items-center gap-1 w-5 shrink-0 pt-0.5 border-r border-border/30 pr-1.5">
                        <span className="text-[11px] font-bold text-[#ff5500]">{indexStr}</span>
                        <span className="text-[10px] font-bold text-muted-foreground/30">+</span>
                        <div className="w-[1px] flex-1 border-l border-dotted border-[#ff5500]/50 my-1" />
                        <span className="text-[10px] font-bold text-muted-foreground/30">-</span>
                      </div>

                      {/* Image - Chamfered Cut-Corner Shape with Crisp SVG Vector Border */}
                      <div
                        className="relative w-20 h-20 shrink-0"
                        style={{
                          clipPath:
                            "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)",
                        }}
                      >
                        <Image
                          src={item.imageSrc}
                          alt={`${item.name} case`}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        {/* SVG Border Overlay */}
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none z-10"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          fill="none"
                        >
                          <path
                            d="M 8 0 L 92 0 L 100 8 L 100 92 L 92 100 L 8 100 L 0 92 L 0 8 Z"
                            stroke="var(--color-border)"
                            strokeWidth="1"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>

                      {/* Middle Details */}
                      <div className="flex-1 min-w-0 pr-6 pl-0.5">
                        <h3 className="text-xs font-bold leading-tight text-foreground truncate">
                          {item.name}
                        </h3>
                        {item.color &&
                          item.name.toLowerCase() !== item.color.toLowerCase() &&
                          !item.name.toLowerCase().includes(item.color.toLowerCase()) && (
                            <p className="mt-0.5 text-[10px] font-bold text-[#ff5500] leading-none">
                              {item.color}
                            </p>
                          )}
                        <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                          {item.model}
                        </p>

                        {/* Quantity Selector */}
                        <div className="mt-3 flex items-center rounded-lg border border-border bg-background overflow-hidden h-7 w-20">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => updateQuantity(key, item.quantity - 1)}
                            className="w-7 h-full flex items-center justify-center text-[#ff5500] hover:bg-secondary/40 transition-colors font-bold text-xs focus:outline-none"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center text-[10px] font-bold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => updateQuantity(key, item.quantity + 1)}
                            className="w-7 h-full flex items-center justify-center text-[#ff5500] hover:bg-secondary/40 transition-colors font-bold text-xs focus:outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Right Delete and Price */}
                      <button
                        aria-label={`Remove ${item.name}`}
                        className="absolute top-4 right-4 text-muted-foreground/50 hover:text-[#ff5500] transition-colors focus:outline-none"
                        onClick={() => removeItem(key)}
                      >
                        <Trash2 size={14} />
                      </button>

                      <div className="absolute bottom-4 right-4 text-xs font-bold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Promo Coupons Container */}
              <div className="border border-border/60 bg-background rounded-[16px] overflow-hidden text-xs shadow-sm shrink-0">
                {appliedCoupon && activeCoupon ? (
                  <div className="flex flex-col">
                    <div className="p-4 flex flex-col gap-3 bg-background/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground/80 font-sans">
                          Applied Code
                        </span>
                        <button
                          onClick={() => setAppliedCoupon("")}
                          className="text-[11px] font-medium text-muted-foreground hover:text-[#ff5500] underline focus:outline-none font-sans cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-[22px] font-extrabold text-foreground tracking-tight font-display uppercase leading-tight">
                          {appliedCoupon}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-emerald-700 font-semibold font-sans text-[12px]">
                            You save ₹{discountAmount.toLocaleString("en-IN")} INR
                          </span>
                          <span className="bg-emerald-50 border border-emerald-100/50 text-emerald-700 rounded-[4px] px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase font-sans">
                            Applied
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Other Coupons List */}
                    {COUPONS.filter((coupon) => coupon.code !== appliedCoupon).length > 0 && (
                      <div className="border-t border-border/40 divide-y divide-border/30 bg-background/50">
                        {COUPONS.filter((coupon) => coupon.code !== appliedCoupon).map((coupon) => {
                          return (
                            <div
                              key={coupon.code}
                              className="flex items-center justify-between px-3.5 py-3"
                            >
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-display font-bold text-foreground uppercase text-[13px] tracking-wide">
                                  {coupon.code}
                                </span>
                                <span className="font-sans text-[11px] text-muted-foreground/80 leading-tight">
                                  {coupon.desc}
                                </span>
                              </div>
                              <button
                                onClick={() => setAppliedCoupon(coupon.code)}
                                className="border border-border/80 rounded-[8px] px-5 py-1.5 text-[12px] font-sans font-medium uppercase transition-all focus:outline-none text-[#595e6a] hover:bg-secondary/40 hover:text-foreground cursor-pointer"
                              >
                                APPLY
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Input Row & Coupons List */
                  <>
                    <div className="flex h-12 items-center justify-between px-3.5 border-b border-border/40">
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1 min-w-0 pr-3 font-sans font-bold tracking-wide text-foreground placeholder:text-muted-foreground/45 placeholder:font-bold placeholder:tracking-wide focus:outline-none bg-transparent text-[11px]"
                      />
                      <button
                        onClick={() => {
                          if (couponInput.trim()) {
                            setAppliedCoupon(couponInput.trim());
                            setCouponInput("");
                          }
                        }}
                        className="border border-border/80 rounded-[8px] px-5 py-1.5 text-[12px] font-sans font-medium uppercase text-[#595e6a] hover:bg-secondary/40 hover:text-foreground transition-all focus:outline-none"
                      >
                        APPLY
                      </button>
                    </div>

                    <div className="divide-y divide-border/30 bg-background/50">
                      {COUPONS.map((coupon) => {
                        const isApplied = appliedCoupon === coupon.code;
                        return (
                          <div
                            key={coupon.code}
                            className="flex items-center justify-between px-3.5 py-3"
                          >
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className="font-display font-bold text-foreground uppercase text-[13px] tracking-wide">
                                {coupon.code}
                              </span>
                              <span className="font-sans text-[11px] text-muted-foreground/80 leading-tight">
                                {coupon.desc}
                              </span>
                            </div>
                            <button
                              onClick={() => setAppliedCoupon(isApplied ? "" : coupon.code)}
                              className={`border rounded-[8px] px-5 py-1.5 text-[12px] font-sans font-medium uppercase transition-all focus:outline-none ${
                                isApplied
                                  ? "bg-white border-[#ff5500] text-[#ff5500] shadow-sm"
                                  : "border-border/80 text-[#595e6a] hover:bg-secondary/40 hover:text-foreground"
                              }`}
                            >
                              {isApplied ? "APPLIED" : "APPLY"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Add-on Wallet Card */}
              {walletProduct && !hasWallet && (
                <div className="relative overflow-hidden rounded-[16px] border border-border/80 bg-background p-3 flex gap-3 shadow-sm items-center">
                  <div className="relative w-12 h-12 overflow-hidden rounded-lg bg-transparent flex items-center justify-center shrink-0">
                    <Image
                      src={walletProduct.image.url}
                      alt="MagSafe Wallet"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-0.5 z-10 flex-1 min-w-0">
                    <span className="text-[8px] font-extrabold text-[#ff5500] uppercase tracking-wider">
                      Add-on / 01
                    </span>
                    <span className="font-display text-xs font-bold text-foreground truncate">
                      MagSafe Wallet
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      Slim • Magnetic • Secure
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-foreground">+₹399</span>
                    <button
                      onClick={() => addItem({ product: walletProduct })}
                      aria-label="Add MagSafe Wallet"
                      className="grid size-8 place-items-center rounded-full border border-[#ff5500]/20 bg-[#ff5500]/5 text-[#ff5500] hover:bg-[#ff5500] hover:text-white transition-all focus:outline-none"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Totals & Checkout Buttons */}
        {items.length > 0 && (
          <div className="border-t border-border/40 bg-background p-3.5 py-4 space-y-4 shrink-0">
            {/* Totals Section */}
            <div className="space-y-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider font-sans">
              {showTotalsDetails && (
                <div className="space-y-2.5 animate-[fadeIn_0.2s_ease-out_forwards]">
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="h-[1px] flex-1 border-b border-dotted border-border/60 mx-2" />
                    <span className="font-sans font-bold text-foreground text-[13px]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Shipping</span>
                    <span className="h-[1px] flex-1 border-b border-dotted border-border/60 mx-2" />
                    <span className="font-sans font-bold text-[#ff5500] text-[13px]">FREE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Discount</span>
                    <span className="h-[1px] flex-1 border-b border-dotted border-border/60 mx-2" />
                    <span className="font-sans font-bold text-[#ff5500] text-[13px]">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowTotalsDetails(!showTotalsDetails)}
                className="w-full flex justify-between items-center border-t border-border/30 pt-3 text-foreground focus:outline-none hover:opacity-85 transition-opacity"
              >
                <span className="flex items-baseline font-sans font-bold text-sm tracking-normal text-foreground normal-case">
                  Total
                  <span className="text-muted-foreground/50 text-[11px] font-normal lowercase tracking-normal ml-1.5">
                    {showTotalsDetails ? "(hide details)" : "(show details)"}
                  </span>
                </span>
                <span className="h-[1px] flex-1 border-b border-dotted border-border/80 mx-2" />
                <span className="font-sans font-bold text-[16px] text-foreground flex items-center gap-1.5 tracking-normal">
                  ₹{Math.max(0, subtotal - discountAmount).toLocaleString("en-IN")}
                  <ChevronDown
                    size={14}
                    className={`text-[#ff5500] transition-transform duration-200 ${
                      showTotalsDetails ? "rotate-180" : ""
                    }`}
                  />
                </span>
              </button>
            </div>

            {/* Checkout Action Buttons */}
            <div className="pt-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex h-12 items-center justify-between rounded-full bg-[linear-gradient(180deg,#ff9d54_0%,#ff5500_100%)] border border-[#e04b00] px-6 text-[12px] font-display font-extrabold tracking-[0.08em] text-[#000000] uppercase hover:opacity-95 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_12px_rgba(255,85,0,0.25)] focus:outline-none"
              >
                <ShoppingBag size={16} className="text-[#000000]" />
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} className="text-[#000000]" />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
