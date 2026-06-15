import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { getProducts } from "@/lib/catalog";

type CheckoutItemInput = {
  variantId?: string;
  productId?: string;
  slug?: string;
  modelId?: string;
  modelSlug?: string;
  quantity?: number;
};

type CheckoutRequest = {
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    pincode?: string;
  };
  paymentMethod?: "COD" | "UPI";
  items?: CheckoutItemInput[];
};

function createOrderNumber() {
  return `TIP-${Date.now().toString(36).toUpperCase()}`;
}

function isUuid(value?: string) {
  return Boolean(
    value?.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutRequest;
  const customer = body.customer;

  if (
    !customer?.name ||
    !customer.phone ||
    !customer.email ||
    !customer.address ||
    !customer.pincode
  ) {
    return NextResponse.json({ error: "Delivery details are required." }, { status: 400 });
  }

  const customerDetails = {
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    pincode: customer.pincode,
  };

  if (!body.items?.length) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }

  const products = await getProducts();
  const validatedItems = body.items.map((item) => {
    const product = products.find(
      (candidate) => candidate.id === item.productId || candidate.slug === item.slug,
    );
    const quantity = Math.max(1, Number(item.quantity ?? 1));
    const selectedModel = product?.modelOptions.find(
      (model) =>
        model.variantId === item.variantId ||
        model.id === item.modelId ||
        model.slug === item.modelSlug,
    );

    if (!product) {
      return null;
    }

    if (product.requiresModelFit && (!selectedModel || !selectedModel.isAvailable)) {
      return null;
    }

    if (selectedModel && selectedModel.stock < quantity) {
      return null;
    }

    const unitPrice = selectedModel?.price ?? product.price;

    return {
      product,
      model: selectedModel,
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
    };
  });

  if (validatedItems.some((item) => !item)) {
    return NextResponse.json(
      { error: "One or more items are no longer available." },
      { status: 409 },
    );
  }

  const items = validatedItems.filter(Boolean) as Array<
    NonNullable<(typeof validatedItems)[number]>
  >;
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;
  const orderNumber = createOrderNumber();
  const paymentMethod = body.paymentMethod === "COD" ? "COD" : "UPI";
  const db = getDb();

  if (!db) {
    return NextResponse.json({
      orderNumber,
      subtotal,
      shipping,
      total,
      devMode: true,
    });
  }

  if (
    items.some(
      (item) =>
        !isUuid(item.product.id) ||
        (item.model?.variantId && !isUuid(item.model.variantId)) ||
        (item.product.requiresModelFit && !isUuid(item.model?.id)),
    )
  ) {
    return NextResponse.json(
      { error: "Database catalog is not ready. Run the Drizzle variant migration first." },
      { status: 500 },
    );
  }

  try {
    const order = await db.transaction(async (tx) => {
      const [createdOrder] = await tx
        .insert(schema.orders)
        .values({
          orderNumber,
          customerName: customerDetails.name,
          phone: customerDetails.phone,
          email: customerDetails.email,
          address: customerDetails.address,
          pincode: customerDetails.pincode,
          paymentMethod,
          subtotal,
          shipping,
          total,
          status: "new",
        })
        .returning({
          id: schema.orders.id,
          orderNumber: schema.orders.orderNumber,
        });

      if (!createdOrder) {
        throw new Error("Could not create order.");
      }

      await tx.insert(schema.orderItems).values(
        items.map((item) => ({
          orderId: createdOrder.id,
          productId: item.product.id,
          variantId: item.model?.variantId ?? null,
          iphoneModelId: item.product.requiresModelFit ? (item.model?.id ?? null) : null,
          productName: item.product.name,
          modelName: item.product.requiresModelFit
            ? (item.model?.name ?? "iPhone")
            : item.product.category,
          sku: item.model?.sku ?? item.product.slug,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
      );

      for (const item of items) {
        const nextStock = Math.max(0, (item.model?.stock ?? 0) - item.quantity);

        if (item.model?.variantId) {
          await tx
            .update(schema.productVariants)
            .set({
              stock: nextStock,
              isAvailable: nextStock > 0,
              updatedAt: new Date(),
            })
            .where(eq(schema.productVariants.id, item.model.variantId));
        }

        if (item.model?.inventoryId && isUuid(item.model.inventoryId)) {
          await tx
            .update(schema.productModelInventory)
            .set({
              stock: nextStock,
              isAvailable: nextStock > 0,
              updatedAt: new Date(),
            })
            .where(eq(schema.productModelInventory.id, item.model.inventoryId));
        }
      }

      return createdOrder;
    });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      subtotal,
      shipping,
      total,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create order." },
      { status: 500 },
    );
  }
}
