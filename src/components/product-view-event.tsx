"use client";

import { useEffect } from "react";

import type { Product } from "@/data/products";
import { trackMarketingEvent } from "@/components/marketing-pixels";

export function ProductViewEvent({ product }: { product: Product }) {
  useEffect(() => {
    trackMarketingEvent("ViewContent", {
      content_ids: [product.slug],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "INR",
    });
  }, [product.name, product.price, product.slug]);

  return null;
}
