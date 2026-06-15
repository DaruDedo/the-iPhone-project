"use client";

import { PackageCheck, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { formatPrice } from "@/data/products";

type TrackedOrder = {
  orderNumber: string;
  status: string;
  customerName: string;
  phone: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
  items: Array<{
    productName: string;
    modelName: string;
    sku: string;
    quantity: number;
    lineTotal: number;
  }>;
};

const statusSteps = ["new", "confirmed", "packed", "shipped", "delivered"];

export default function TrackOrderPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const orderNumber = String(form.get("order") ?? "");
    const phone = String(form.get("phone") ?? "");
    const response = await fetch(
      `/api/orders/track?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`,
    );
    const result = (await response.json()) as { order?: TrackedOrder; error?: string };

    setLoading(false);

    if (!response.ok || !result.order) {
      setError(result.error ?? "Could not find that order.");
      return;
    }

    setOrder(result.order);
  }

  const activeIndex = order
    ? Math.max(
        0,
        statusSteps.findIndex((step) => step === order.status),
      )
    : -1;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Tracking</p>
        <h1 className="mt-4 text-5xl font-bold md:text-7xl">Track your order.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Enter your order number and phone number to see the current fulfilment status.
        </p>

        <form
          onSubmit={handleTrack}
          className="mt-10 grid gap-3 rounded-3xl border border-border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] sm:p-5"
        >
          <input
            name="order"
            required
            placeholder="Order number, e.g. TIP-LX..."
            className="h-12 rounded-full border border-border bg-background px-5 text-sm outline-none focus:border-foreground/40"
          />
          <input
            name="phone"
            required
            placeholder="Phone number"
            className="h-12 rounded-full border border-border bg-background px-5 text-sm outline-none focus:border-foreground/40"
          />
          <button
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-90"
          >
            <Search size={16} />
            {loading ? "Checking..." : "Track"}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm text-foreground">
            {error}
          </div>
        )}

        {order && (
          <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  {order.orderNumber}
                </p>
                <h2 className="mt-2 text-3xl font-bold">{order.status}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {order.customerName} / {order.paymentMethod}
                </p>
              </div>
              <div className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
                {formatPrice(order.total)}
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-5">
              {statusSteps.map((step, index) => (
                <div
                  key={step}
                  className={`rounded-2xl border p-4 ${
                    index <= activeIndex
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <PackageCheck size={18} />
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              {order.items.map((item) => (
                <article
                  key={`${item.sku}-${item.modelName}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4"
                >
                  <div>
                    <p className="text-sm font-bold">{item.productName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.modelName} / {item.sku} / Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-mono text-sm font-bold">{formatPrice(item.lineTotal)}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
