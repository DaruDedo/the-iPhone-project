"use client";

import Link from "next/link";
import { Copy } from "lucide-react";
import { useState } from "react";

const templates = [
  {
    title: "Order success",
    body: "Hello {name}, your The iPhone Project order is confirmed. Order ID: {orderNumber}. Total: {orderTotal}. We will pack and dispatch it soon.",
  },
  {
    title: "Payment pending",
    body: "Hello {name}, your order {orderNumber} is waiting for payment confirmation. Please complete UPI payment or share the payment screenshot here.",
  },
  {
    title: "Dispatch update",
    body: "Hello {name}, your order {orderNumber} has been dispatched. Carrier: {carrier}. Tracking: {trackingNumber}. Track here: {trackingUrl}",
  },
  {
    title: "Out of stock alternative",
    body: "Hello {name}, the selected product for {model} is currently out of stock. We can offer {alternativeProduct} instead. Would you like us to switch it?",
  },
  {
    title: "Compatibility reply",
    body: "Yes, this product is made for {model}. Please select the exact iPhone model before checkout so we ship the correct fit.",
  },
  {
    title: "Instagram reply",
    body: "Hey! This is available for selected iPhone models. You can order directly here: {productUrl}. COD and UPI are available.",
  },
];

export default function AdminTemplatesPage() {
  const [copied, setCopied] = useState("");

  async function copyTemplate(title: string, body: string) {
    await navigator.clipboard.writeText(body);
    setCopied(title);
    window.setTimeout(() => setCopied(""), 1400);
  }

  return (
    <main className="min-h-screen bg-background px-3 py-10 text-foreground sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-4xl font-bold md:text-6xl">Templates.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Copy-ready WhatsApp and customer support messages with placeholders.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <article key={template.title} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">{template.title}</h2>
                <button
                  onClick={() => copyTemplate(template.title, template.body)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition hover:border-foreground/35"
                >
                  <Copy size={14} />
                  {copied === template.title ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {template.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
