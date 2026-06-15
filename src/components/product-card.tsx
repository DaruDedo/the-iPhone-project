"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { formatPrice, type Product } from "@/data/products";
import { productPath } from "@/lib/routes";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const selectedModel =
    product.selectedModel ?? product.modelOptions.find((model) => model.isAvailable);
  const fitLabel = product.requiresModelFit
    ? `For ${selectedModel?.name ?? product.models[0] ?? "iPhone"}`
    : product.category;

  return (
    <article className="group relative min-w-0 bg-transparent transition-all duration-300 hover:-translate-y-1">
      <div className="absolute left-1 top-1 z-20">
        <span className="rounded-full border border-white/55 bg-white/45 px-2 py-0.5 text-[8px] font-medium uppercase tracking-normal text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_6px_16px_rgba(0,0,0,0.12)] backdrop-blur-xl md:text-[9px]">
          {product.tag}
        </span>
      </div>

      <Link
        href={productPath(product)}
        className="relative block aspect-square overflow-hidden bg-muted/25"
        style={{
          clipPath: "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)",
        }}
      >
        <Image
          src={product.image.url}
          alt={product.image.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="scale-[1.04] object-cover drop-shadow-xl transition-transform duration-700 group-hover:scale-110"
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
      </Link>

      <div className="px-1 pt-3">
        <p className="font-sans text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:text-[10px] md:text-[11px] leading-tight">
          {fitLabel}
        </p>
        <h3 className="mt-1 font-display text-xs sm:text-sm font-bold uppercase tracking-tight text-foreground truncate leading-snug">
          {product.name}
        </h3>

        <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-1">
          <span className="min-w-0 font-mono text-[15px] font-bold leading-none md:text-lg">
            {formatPrice(product.price)}
          </span>
          <button
            data-testid={`add-${product.slug}`}
            aria-label={`Add ${product.name} to bag`}
            className="inline-flex size-8 items-center justify-center rounded-full border border-border bg-white/80 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_5px_14px_rgba(0,0,0,0.12)] backdrop-blur transition hover:bg-white md:size-9"
            onClick={() =>
              addItem({
                product,
                color: product.name,
                variantId: selectedModel?.variantId,
                model: selectedModel?.name,
                modelId: selectedModel?.id,
                modelSlug: selectedModel?.slug,
                inventoryId: selectedModel?.inventoryId,
                sku: selectedModel?.sku,
              })
            }
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
