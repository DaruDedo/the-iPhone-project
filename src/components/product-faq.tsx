"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import type { ProductFaqItem } from "@/lib/product-faqs";

export function ProductFaq({ faqs }: { faqs: ProductFaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="mx-auto max-w-5xl px-3 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">FAQ</p>
        <h2 className="text-4xl font-bold md:text-5xl">Good to know.</h2>
      </div>

      <div className="mt-8 grid gap-3">
        {faqs.slice(0, 5).map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <article
              key={faq.question}
              className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-[0_16px_45px_rgba(0,0,0,0.04)]"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <span className="font-sans text-base font-semibold leading-6 md:text-lg">
                  {faq.question}
                </span>
                <Plus
                  className={`size-5 shrink-0 text-muted-foreground transition ${isOpen ? "rotate-45" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0">
                  <p className="max-w-3xl font-sans text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                    {faq.answer}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
