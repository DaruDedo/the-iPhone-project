"use client";

import Image from "next/image";
import Link from "next/link";
import { CreditCard, MapPin, ShieldCheck, Truck } from "lucide-react";
import { useState, useMemo, useEffect, type FormEvent } from "react";

import { getCartItemKey, useCart } from "@/components/cart-provider";
import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { formatPrice } from "@/data/products";
import { siteConfig } from "@/lib/site";

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [placedOrderDetails, setPlacedOrderDetails] = useState<{
    orderNumber: string;
    name: string;
    phone: string;
    total: number;
    paymentMethod: string;
  } | null>(null);

  // User Authentication pre-filling state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    pincode: "",
    address: "",
  });

  useEffect(() => {
    async function checkUserSession() {
      try {
        const token = localStorage.getItem("user_session_token");
        const email = localStorage.getItem("user_session_email");

        if (token && email) {
          setIsLoggedIn(true);
          setLoggedInEmail(email);

          // Fetch profile details from backend
          const res = await fetch("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const profile = await res.json();
            setFormData({
              name: profile.name || "",
              phone: profile.phone || "",
              email: profile.email || email,
              pincode: profile.pincode || "",
              address: profile.address || "",
            });
          } else {
            setFormData((prev) => ({
              ...prev,
              email: email,
            }));
          }
        }
      } catch (err) {
        console.error("Error loading session on checkout page:", err);
      }
    }
    checkUserSession();
  }, []);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const whatsappUrl = useMemo(() => {
    if (!placedOrderDetails) return "";

    const message = `Hi The iPhone Project! I just placed an order.
Order Number: ${placedOrderDetails.orderNumber}
Name: ${placedOrderDetails.name}
Phone: ${placedOrderDetails.phone}
Total Amount: ${formatPrice(placedOrderDetails.total)}
Payment Method: ${placedOrderDetails.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "UPI Payment"}

Please confirm my order!`;

    return `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(message)}`;
  }, [placedOrderDetails]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          pincode: form.get("pincode"),
          address: form.get("address"),
        },
        paymentMethod: form.get("payment"),
        items: items.map((item) => ({
          variantId: item.variantId,
          productId: item.productId,
          slug: item.slug,
          modelId: item.modelId,
          modelSlug: item.modelSlug,
          quantity: item.quantity,
        })),
      }),
    });
    const result = (await response.json()) as { orderNumber?: string; error?: string };

    setIsSubmitting(false);

    if (!response.ok || !result.orderNumber) {
      setError(result.error ?? "Could not place your order. Please try again.");
      return;
    }

    clearCart();
    setPlacedOrderDetails({
      orderNumber: result.orderNumber,
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      total: total,
      paymentMethod: String(form.get("payment")),
    });
    setOrderNumber(result.orderNumber);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_420px] lg:py-20">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Secure checkout
          </p>
          <h1 className="text-4xl font-bold md:text-6xl">Finish your order.</h1>

          {orderNumber ? (
            <div className="mt-12 rounded-3xl bg-muted/50 p-6 sm:p-10 text-center space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Order received
                </p>
                <h2 className="mt-3 text-3xl font-bold">Thank you.</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  Your order number is{" "}
                  <span className="font-medium text-foreground">{orderNumber}</span>.
                </p>
              </div>

              {placedOrderDetails?.paymentMethod === "UPI" && (
                <div className="mx-auto max-w-md border border-amber-200 bg-amber-50/50 p-5 rounded-2xl space-y-3 dark:bg-amber-950/10 dark:border-amber-900/30">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                    UPI Payment Verification
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Please send{" "}
                    <strong className="text-foreground">
                      {formatPrice(placedOrderDetails.total)}
                    </strong>{" "}
                    to our official UPI ID:{" "}
                    <code className="bg-background px-1.5 py-0.5 rounded border font-bold text-foreground font-mono">
                      {siteConfig.upiId}
                    </code>{" "}
                    or verify on WhatsApp.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] px-6 py-2.5 text-sm font-semibold text-white transition"
                >
                  <svg className="size-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.362a9.92 9.92 0 0 0 4.808 1.24h.005c5.505 0 9.99-4.479 9.99-9.987C22.007 6.478 17.521 2 12.012 2zm5.727 14.12c-.25.707-1.464 1.3-2.008 1.383-.49.076-1.127.135-3.266-.752-2.735-1.135-4.5-3.914-4.637-4.096-.137-.182-1.107-1.472-1.107-2.81 0-1.337.7-1.996.95-2.262.25-.266.545-.333.727-.333h.523c.182 0 .428-.067.668.514.25.602.85 2.083.923 2.23.072.15.12.327.02.523-.1.196-.15.319-.296.49-.145.17-.304.382-.435.513-.146.147-.3.308-.13.602.17.294.755 1.25 1.623 2.023.717.638 1.32.836 1.603.954.282.118.446.1.614-.095.168-.196.726-.847.922-1.137.196-.29.39-.24.66-.14.27.1.1.722.56.924.46.202 2.9.155 3.396.9.197.29.3.626.046 1.332z" />
                  </svg>
                  Confirm on WhatsApp
                </a>
                <Link
                  href={`/track-order`}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition"
                >
                  Track order
                </Link>
                <Link
                  href="/#shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border px-6 py-2.5 text-sm font-semibold hover:border-foreground/35 transition"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-12 rounded-3xl bg-muted/50 p-10 text-center">
              <h2 className="text-2xl font-bold">Your bag is empty.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Add a cover from The iPhone Project before checkout. Your selected model, colour,
                and quantity will appear here.
              </p>
              <Link
                href="/#shop"
                className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
              >
                Shop covers
              </Link>
            </div>
          ) : (
            <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-foreground">
                  {error}
                </div>
              )}
              <section className="rounded-3xl border border-border p-6">
                <div className="mb-5 flex items-center gap-2">
                  <MapPin size={18} />
                  <h2 className="text-xl font-bold">Delivery details</h2>
                </div>
                {isLoggedIn && (
                  <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100/50 p-3.5 text-xs text-emerald-800 font-sans">
                    Logged in as <strong className="font-bold">{loggedInEmail}</strong>. Your
                    shipping details are pre-filled.
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["Full name", "Aarav Sharma", "name"],
                    ["Phone", siteConfig.phone, "phone"],
                    ["Email", "you@email.com", "email"],
                    ["PIN code", "560001", "pincode"],
                  ].map(([label, placeholder, name]) => (
                    <label key={label} className="block">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {label}
                      </span>
                      <input
                        name={name}
                        required
                        value={formData[name as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                        placeholder={placeholder}
                        className="mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-foreground/50"
                      />
                    </label>
                  ))}
                  <label className="block md:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Address
                    </span>
                    <textarea
                      name="address"
                      required
                      rows={4}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="House number, street, area, city, state"
                      className="mt-2 w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-foreground/50"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-3xl border border-border p-6">
                <div className="mb-5 flex items-center gap-2">
                  <CreditCard size={18} />
                  <h2 className="text-xl font-bold">Payment</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["UPI", "UPI"],
                    ["Cash on delivery", "COD"],
                  ].map(([method, value], index) => (
                    <label
                      key={method}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-4 text-sm"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        defaultChecked={index === 0}
                        className="accent-foreground"
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </section>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-90 md:w-auto"
              >
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </form>
          )}
        </div>

        <aside className="h-fit rounded-3xl bg-muted/40 p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="mt-6 space-y-5">
            {items.map((item) => {
              const key = getCartItemKey(item);
              return (
                <article key={key} className="grid grid-cols-[72px_1fr] gap-4">
                  <div
                    className="relative aspect-square overflow-hidden bg-background"
                    style={{
                      clipPath:
                        "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)",
                    }}
                  >
                    <Image
                      src={item.imageSrc}
                      alt={`${item.name} case`}
                      fill
                      sizes="72px"
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
                  <div>
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold">{item.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.model} / {item.color}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <select
                      value={item.quantity}
                      onChange={(event) => updateQuantity(key, Number(event.target.value))}
                      className="mt-3 h-9 rounded-full border border-border bg-background px-3 text-xs outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((quantity) => (
                        <option key={quantity} value={quantity}>
                          Qty {quantity}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className={shipping === 0 ? "" : "font-mono"}>
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between pt-3 text-base font-bold">
              <span>Total</span>
              <span className="font-mono">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-xs text-muted-foreground">
            {[
              { icon: Truck, text: "Ships in 24 hours from Bengaluru" },
              { icon: ShieldCheck, text: "Protected checkout and easy returns" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={15} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
