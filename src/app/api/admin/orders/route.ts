import { desc, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { sendOrderStatusUpdateEmail } from "@/lib/emails";
import { isAdminError, requireAdmin } from "@/lib/admin-auth";
import { getTimeframeStartDate } from "@/lib/timeframe";

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

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const startDate = getTimeframeStartDate(timeframe);

  try {
    const orders = await db.query.orders.findMany({
      where: gte(schema.orders.createdAt, startDate),
      orderBy: [desc(schema.orders.createdAt)],
      limit: 100,
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
    const order = await db.query.orders.findFirst({
      where: eq(schema.orders.id, body.orderId),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await db
      .update(schema.orders)
      .set({ status: body.status, updatedAt: new Date() })
      .where(eq(schema.orders.id, body.orderId));

    // Send Status Update Email asynchronously
    try {
      sendOrderStatusUpdateEmail(
        {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          email: order.email,
        },
        body.status,
      ).catch((err) => {
        console.error("Async Order Status Update email failed:", err);
      });
    } catch (emailErr) {
      console.error("Error setting up Order Status Update email:", emailErr);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update order." },
      { status: 500 },
    );
  }
}
