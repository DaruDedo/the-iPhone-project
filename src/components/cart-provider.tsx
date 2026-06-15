"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Product } from "@/data/products";

export type CartItem = {
  productId?: string;
  slug: string;
  name: string;
  price: number;
  imageSrc: string;
  color: string;
  variantId?: string;
  modelId?: string;
  modelSlug?: string;
  model: string;
  inventoryId?: string;
  sku?: string;
  quantity: number;
};

type AddToCartInput = {
  product: Product;
  color?: string;
  variantId?: string;
  model?: string;
  modelId?: string;
  modelSlug?: string;
  inventoryId?: string;
  sku?: string;
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddToCartInput) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getKey(item: Pick<CartItem, "slug" | "color" | "model"> & Partial<CartItem>) {
  return `${item.variantId ?? item.productId ?? item.slug}|${item.modelId ?? item.modelSlug ?? item.model}|${item.color}`;
}

export function getCartItemKey(
  item: Pick<CartItem, "slug" | "color" | "model"> & Partial<CartItem>,
) {
  return getKey(item);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("tip-cart");
    if (saved) {
      setItems(JSON.parse(saved) as CartItem[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("tip-cart", JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      isOpen,
      itemCount,
      subtotal,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: ({
        product,
        color,
        variantId,
        model,
        modelId,
        modelSlug,
        inventoryId,
        sku,
        quantity = 1,
      }) => {
        setItems((current) => {
          const selectedModel =
            product.modelOptions.find(
              (option) =>
                option.variantId === variantId ||
                option.id === modelId ||
                option.slug === modelSlug ||
                option.name === model,
            ) ??
            product.selectedModel ??
            product.modelOptions[0];
          const nextItem: CartItem = {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: selectedModel?.price ?? product.price,
            imageSrc: product.image.url,
            color: color ?? product.name,
            variantId: variantId ?? selectedModel?.variantId,
            modelId: modelId ?? selectedModel?.id,
            modelSlug: modelSlug ?? selectedModel?.slug,
            model:
              model ??
              selectedModel?.name ??
              (product.requiresModelFit ? product.models[0] : product.category) ??
              "iPhone",
            inventoryId: inventoryId ?? selectedModel?.inventoryId,
            sku: sku ?? selectedModel?.sku ?? product.slug,
            quantity,
          };
          const key = getKey(nextItem);
          const found = current.find((item) => getKey(item) === key);

          if (!found) {
            return [...current, nextItem];
          }

          return current.map((item) =>
            getKey(item) === key ? { ...item, quantity: item.quantity + quantity } : item,
          );
        });
        setIsOpen(true);
      },
      updateQuantity: (key, quantity) => {
        setItems((current) =>
          current
            .map((item) =>
              getKey(item) === key ? { ...item, quantity: Math.max(0, quantity) } : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem: (key) => {
        setItems((current) => current.filter((item) => getKey(item) !== key));
      },
      clearCart: () => setItems([]),
    };
  }, [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return value;
}
