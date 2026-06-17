import type { CartItem } from "@/components/cart-provider";

export type CouponCode = "CASEGLASS" | "MODEL10" | "BUY2SAVE" | "FREESHIP" | "LAUNCH" | "BUY3GET1";

export type CouponDefinition = {
  code: CouponCode;
  title: string;
  description: string;
};

export type CouponEvaluation = CouponDefinition & {
  eligible: boolean;
  discount: number;
  progressMessage: string;
  invalidReason?: string;
  successMessage?: string;
};

export const coupons: CouponDefinition[] = [
  {
    code: "CASEGLASS",
    title: "Case + Glass Combo",
    description: "Bundle any iPhone case with tempered glass and save Rs. 150.",
  },
  {
    code: "MODEL10",
    title: "Model Collection Deal",
    description: "Save 10% when every item is for the same selected iPhone model.",
  },
  {
    code: "BUY2SAVE",
    title: "Buy 2 Save",
    description: "Buy any two products and save Rs. 200.",
  },
  {
    code: "FREESHIP",
    title: "Free Shipping",
    description: "Free shipping unlocks over Rs. 999.",
  },
  {
    code: "LAUNCH",
    title: "Launch Discount",
    description: "Save Rs. 100 on launch orders above Rs. 999.",
  },
  {
    code: "BUY3GET1",
    title: "Buy 3 Get 1",
    description: "Buy any 3 eligible items and get the lowest-priced item free.",
  },
];

function itemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function hasCategory(items: CartItem[], categorySlug: string) {
  return items.some((item) => item.slug.includes(categorySlug) || item.sku?.includes(categorySlug));
}

function lowestUnitPrice(items: CartItem[]) {
  return Math.min(
    ...items.flatMap((item) => Array.from({ length: item.quantity }, () => item.price)),
  );
}

function getSameModel(items: CartItem[]) {
  const modelSlugs = items.map((item) => item.modelSlug || item.model).filter(Boolean);
  const [first] = modelSlugs;

  return Boolean(first && modelSlugs.length > 0 && modelSlugs.every((model) => model === first));
}

export function evaluateCoupon(
  code: string,
  items: CartItem[],
  subtotal: number,
): CouponEvaluation {
  const normalizedCode = code.trim().toUpperCase() as CouponCode;
  const coupon = coupons.find((item) => item.code === normalizedCode) ?? coupons[0];
  const count = itemCount(items);

  if (coupon.code === "CASEGLASS") {
    const hasCase = items.some((item) => item.slug.includes("case") || item.slug.includes("cover"));
    const hasGlass =
      hasCategory(items, "tempered-glass") ||
      items.some(
        (item) => item.slug.includes("glass") || item.name.toLowerCase().includes("glass"),
      );

    if (hasCase && hasGlass) {
      return {
        ...coupon,
        eligible: true,
        discount: 150,
        progressMessage: "Case + tempered glass combo unlocked.",
        successMessage: "Combo unlocked. Rs. 150 will be reduced at checkout.",
      };
    }

    return {
      ...coupon,
      eligible: false,
      discount: 0,
      progressMessage: hasCase
        ? "Add tempered glass to unlock this combo."
        : "Add one case and one tempered glass to unlock this combo.",
      invalidReason: "This coupon needs one case and one tempered glass.",
    };
  }

  if (coupon.code === "MODEL10") {
    if (items.length > 0 && getSameModel(items)) {
      return {
        ...coupon,
        eligible: true,
        discount: Math.round(subtotal * 0.1),
        progressMessage: "Same-model collection discount unlocked.",
        successMessage: "10% same-model discount applied.",
      };
    }

    return {
      ...coupon,
      eligible: false,
      discount: 0,
      progressMessage: "Keep all products for one iPhone model to unlock 10% off.",
      invalidReason: "Cart has mixed or missing iPhone models.",
    };
  }

  if (coupon.code === "BUY2SAVE") {
    if (count >= 2) {
      return {
        ...coupon,
        eligible: true,
        discount: 200,
        progressMessage: "Buy 2 Save offer unlocked.",
        successMessage: "Rs. 200 off applied.",
      };
    }

    return {
      ...coupon,
      eligible: false,
      discount: 0,
      progressMessage: "Add 1 more product to unlock Buy 2 Save.",
      invalidReason: "This coupon needs at least two products.",
    };
  }

  if (coupon.code === "FREESHIP") {
    if (subtotal >= 999) {
      return {
        ...coupon,
        eligible: true,
        discount: 0,
        progressMessage: "Free shipping unlocked.",
        successMessage: "Free shipping is active on this cart.",
      };
    }

    return {
      ...coupon,
      eligible: false,
      discount: 0,
      progressMessage: `Add Rs. ${999 - subtotal} more for free shipping.`,
      invalidReason: "Free shipping unlocks above Rs. 999.",
    };
  }

  if (coupon.code === "BUY3GET1") {
    if (count >= 3) {
      return {
        ...coupon,
        eligible: true,
        discount: lowestUnitPrice(items),
        progressMessage: "Buy 3 Get 1 unlocked. Lowest-priced item becomes free.",
        successMessage: "Offer unlocked. One eligible item will be free.",
      };
    }

    return {
      ...coupon,
      eligible: false,
      discount: 0,
      progressMessage: `Add ${3 - count} more product${3 - count === 1 ? "" : "s"} to unlock Buy 3 Get 1.`,
      invalidReason: "This coupon needs three products.",
    };
  }

  if (subtotal >= 999) {
    return {
      ...coupon,
      eligible: true,
      discount: 100,
      progressMessage: "Launch discount unlocked.",
      successMessage: "Rs. 100 launch discount applied.",
    };
  }

  return {
    ...coupon,
    eligible: false,
    discount: 0,
    progressMessage: `Add Rs. ${999 - subtotal} more to unlock LAUNCH.`,
    invalidReason: "LAUNCH works above Rs. 999.",
  };
}

export function getBestCoupon(items: CartItem[], subtotal: number) {
  return coupons
    .map((coupon) => evaluateCoupon(coupon.code, items, subtotal))
    .sort((a, b) => b.discount - a.discount)[0];
}
