import { NextResponse } from "next/server";

import type { CartItem } from "@/components/cart-provider";
import { coupons, evaluateCoupon, getBestCoupon } from "@/lib/coupons";

type CouponRequest = {
  code?: string;
  items?: CartItem[];
  subtotal?: number;
};

export async function GET() {
  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CouponRequest;
  const items = body.items ?? [];
  const subtotal =
    typeof body.subtotal === "number"
      ? body.subtotal
      : items.reduce((total, item) => total + item.price * item.quantity, 0);
  const evaluation = body.code
    ? evaluateCoupon(body.code, items, subtotal)
    : getBestCoupon(items, subtotal);

  return NextResponse.json({ coupon: evaluation });
}
