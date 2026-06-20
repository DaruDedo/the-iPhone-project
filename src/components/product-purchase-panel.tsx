"use client";

import { useState } from "react";
import { Check, MessageCircle, Minus, Plus, ShoppingBag, ShieldCheck, Truck } from "lucide-react";

import { useCart } from "@/components/cart-provider";
import { IphoneModelSelector } from "@/components/iphone-model-selector";
import { formatPrice, type Product } from "@/data/products";
import { siteConfig } from "@/lib/site";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const availableModels = product.modelOptions.filter((model) => model.isAvailable);
  const [modelSlug, setModelSlug] = useState(
    product.selectedModel?.slug ?? availableModels[0]?.slug ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const selectedModel =
    availableModels.find((model) => model.slug === modelSlug) ?? availableModels[0];
  const activePrice = selectedModel?.price ?? product.price;
  const activeMrp = selectedModel?.mrp ?? product.mrp;
  const off =
    activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;
  const whatsappMessage = siteConfig.whatsappPhone
    ? encodeURIComponent(
        `Hi The iPhone Project, I need help with ${product.name}${selectedModel?.name ? ` for ${selectedModel.name}` : ""}. Price: ${formatPrice(activePrice)}.`,
      )
    : "";

  return (
    <div className="min-w-0 overflow-hidden rounded-3xl border border-border bg-card/85 p-5 shadow-[0_22px_65px_rgba(0,0,0,0.06)] backdrop-blur lg:sticky lg:top-24 lg:p-6">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground sm:tracking-[0.24em]">
        {product.category}
      </p>
      <h1 className="mt-3 overflow-wrap-anywhere text-3xl font-bold tracking-tight min-[360px]:text-4xl md:text-5xl">
        {product.name}
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
        {product.description}
      </p>

      <div className="mt-5 flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-3xl font-bold leading-none">
          {formatPrice(activePrice)}
        </span>
        {activeMrp > activePrice && (
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(activeMrp)}
          </span>
        )}
        {off > 0 && (
          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-bold uppercase text-foreground">
            {off}% off
          </span>
        )}
      </div>

      {product.requiresModelFit ? (
        <IphoneModelSelector
          className="mt-7"
          models={availableModels}
          onChange={setModelSlug}
          value={modelSlug}
        />
      ) : (
        <div className="mt-7 rounded-2xl bg-muted/50 p-4 text-sm">
          Fits all compatible iPhone setups.
        </div>
      )}

      <div className="mt-7 flex gap-2.5">
        <div className="flex h-11 shrink-0 items-center rounded-full border border-border bg-background/80">
          <button
            aria-label="Decrease quantity"
            className="grid size-9 place-items-center"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            type="button"
          >
            <Minus size={15} />
          </button>
          <span className="w-6 text-center text-sm font-bold">{quantity}</span>
          <button
            aria-label="Increase quantity"
            className="grid size-9 place-items-center"
            onClick={() => setQuantity((value) => value + 1)}
            type="button"
          >
            <Plus size={15} />
          </button>
        </div>
        <button
          className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition hover:opacity-90"
          disabled={product.requiresModelFit && !selectedModel}
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
              quantity,
            })
          }
          type="button"
        >
          <ShoppingBag size={17} />
          <span className="min-w-0 truncate">Add to bag</span>
        </button>
      </div>
      {siteConfig.whatsappPhone && (
        <a
          href={`https://wa.me/${siteConfig.whatsappPhone}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border bg-background/80 px-4 text-sm font-medium transition hover:border-foreground/35"
        >
          <MessageCircle size={17} />
          Ask on WhatsApp
        </a>
      )}

      <div className="mt-7 grid gap-2.5 text-sm">
        {[
          { icon: Truck, text: "Free shipping across India" },
          { icon: ShieldCheck, text: "7-day returns and 6-month warranty" },
          { icon: Check, text: "COD available on supported pin codes" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex min-w-0 items-center gap-3 rounded-2xl bg-muted/50 p-3.5">
            <Icon size={18} className="shrink-0" />
            <span className="min-w-0">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
