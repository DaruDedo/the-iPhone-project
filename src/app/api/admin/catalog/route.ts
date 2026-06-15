import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import {
  createCatalogProduct,
  setProductActive,
  type AdminProductPayload,
} from "@/lib/admin-catalog-writer";
import { isAdminError, requireAdmin } from "@/lib/admin-auth";
import { getIphoneModels, getProductCategories, getProducts } from "@/lib/catalog";
import { productTemplates } from "@/lib/product-templates";

type ProductPatchPayload = {
  productId?: string;
  isActive?: boolean;
  price?: number;
  tag?: string;
  stock?: number;
};

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const [products, models, categories] = await Promise.all([
    getProducts({ includeInactive: true }),
    getIphoneModels(),
    getProductCategories(),
  ]);

  return NextResponse.json({
    products,
    models,
    categories,
    templates: productTemplates,
    devMode: !getDb(),
  });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json(
      { error: "DATABASE_URL is missing. Add it to .env.local before creating products." },
      { status: 503 },
    );
  }

  try {
    const payload = (await request.json()) as AdminProductPayload;
    const product = await createCatalogProduct(db, payload);

    return NextResponse.json({ ok: true, slug: product.slug });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create product." },
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
  const payload = (await request.json()) as ProductPatchPayload;

  if (!payload.productId) {
    return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ ok: true, devMode: true });
  }

  try {
    const productUpdates: Partial<typeof schema.products.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof payload.isActive === "boolean") {
      productUpdates.isActive = payload.isActive;
    }

    if (typeof payload.price === "number" && payload.price > 0) {
      productUpdates.price = payload.price;
      productUpdates.mrp = payload.price;
    }

    if (typeof payload.tag === "string") {
      productUpdates.tag = payload.tag;
    }

    if (Object.keys(productUpdates).length > 1) {
      await db
        .update(schema.products)
        .set(productUpdates)
        .where(eq(schema.products.id, payload.productId));
    } else {
      await setProductActive(db, payload.productId, payload.isActive ?? true);
    }

    if (typeof payload.stock === "number" && payload.stock >= 0) {
      await db
        .update(schema.productVariants)
        .set({
          stock: payload.stock,
          isAvailable: payload.stock > 0,
          updatedAt: new Date(),
        })
        .where(eq(schema.productVariants.productId, payload.productId));

      await db
        .update(schema.productModelInventory)
        .set({
          stock: payload.stock,
          isAvailable: payload.stock > 0,
          updatedAt: new Date(),
        })
        .where(eq(schema.productModelInventory.productId, payload.productId));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ ok: true, devMode: true });
  }

  try {
    await db.delete(schema.products).where(eq(schema.products.id, productId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete product." },
      { status: 500 },
    );
  }
}
