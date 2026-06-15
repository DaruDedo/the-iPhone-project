import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { isAdminError, requireAdmin } from "@/lib/admin-auth";

type OrderStatus = "new" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";

const statuses: OrderStatus[] = ["new", "confirmed", "packed", "shipped", "delivered", "cancelled"];

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ orders: [], devMode: true });
  }

  try {
    const orders = await db.query.orders.findMany({
      orderBy: [desc(schema.orders.createdAt)],
      limit: 50,
      with: {
        items: true,
      },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        id: order.id,
        order_number: order.orderNumber,
        customer_name: order.customerName,
        phone: order.phone,
        email: order.email,
        address: order.address,
        pincode: order.pincode,
        payment_method: order.paymentMethod,
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        status: order.status,
        created_at: order.createdAt,
        order_items: order.items.map((item) => ({
          id: item.id,
          product_name: item.productName,
          model_name: item.modelName,
          sku: item.sku,
          quantity: item.quantity,
          line_total: item.lineTotal,
        })),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load orders." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();
  const body = (await request.json()) as { orderId?: string; status?: OrderStatus };

  if (!body.orderId || !body.status || !statuses.includes(body.status)) {
    return NextResponse.json({ error: "Valid order ID and status are required." }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ ok: true, devMode: true });
  }

  try {
    await db
      .update(schema.orders)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(schema.orders.id, body.orderId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update order." },
      { status: 500 },
    );
  }
}
