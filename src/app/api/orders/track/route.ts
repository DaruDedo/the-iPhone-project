import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

export async function GET(request: Request) {
  const db = getDb();
  const url = new URL(request.url);
  const orderNumber = url.searchParams.get("order")?.trim().toUpperCase();
  const phone = url.searchParams.get("phone")?.trim();

  if (!orderNumber || !phone) {
    return NextResponse.json(
      { error: "Order number and phone number are required." },
      { status: 400 },
    );
  }

  if (!db) {
    return NextResponse.json(
      { error: "Order tracking needs DATABASE_URL to be configured." },
      { status: 503 },
    );
  }

  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.orderNumber, orderNumber),
    with: {
      items: true,
    },
  });

  if (!order || normalizePhone(order.phone) !== normalizePhone(phone)) {
    return NextResponse.json({ error: "No matching order found." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      phone: order.phone,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shipping: order.shipping,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productName: item.productName,
        modelName: item.modelName,
        sku: item.sku,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
    },
  });
}
