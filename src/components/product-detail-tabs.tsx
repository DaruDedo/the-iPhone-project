"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/data/products";
import { getProductInfoContent } from "@/lib/product-info";

const tabs = ["Details", "Specs", "Shipping"] as const;

type Tab = (typeof tabs)[number];

export function ProductDetailTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<Tab>("Details");
  const content = useMemo(() => getProductInfoContent(product), [product]);

  return (
    <section className="mx-auto max-w-5xl px-3 py-10 sm:px-6 md:py-14">
      <div className="border-b border-border">
        <div className="flex gap-8 text-base text-muted-foreground md:text-lg">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`relative pb-4 transition ${
                activeTab === tab ? "font-medium text-foreground" : "hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Details" && (
        <div className="grid gap-9 py-8">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">What&apos;s in the box</h2>
            <ul className="mt-5 grid gap-4 text-base leading-7 text-foreground/90 md:text-lg">
              {content.inBox.map((item) => (
                <li key={item} className="flex gap-4">
                  <span className="mt-3 size-1.5 shrink-0 rounded-full bg-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Key features</h2>
            <ul className="mt-5 grid gap-4 text-base leading-7 text-foreground/90 md:text-lg">
              {content.keyFeatures.map((item) => (
                <li key={item} className="flex gap-4">
                  <span className="mt-3 size-1.5 shrink-0 rounded-full bg-foreground" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "Specs" && (
        <div className="py-8">
          <div className="overflow-hidden rounded-3xl border border-border bg-card/65">
            {content.specs.map((spec) => (
              <div
                key={spec.label}
                className="grid grid-cols-[0.85fr_1.15fr] gap-4 border-b border-border px-5 py-4 last:border-b-0 md:px-8 md:py-5"
              >
                <span className="text-sm text-muted-foreground md:text-base">{spec.label}</span>
                <span className="text-right text-sm font-semibold md:text-base">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Shipping" && (
        <div className="grid gap-5 py-8">
          {content.shipping.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-border bg-card/75 p-7 md:p-8"
            >
              <h2 className="text-lg font-bold uppercase tracking-tight">{item.title}</h2>
              <p className="mt-2 text-2xl font-bold">{item.time}</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
