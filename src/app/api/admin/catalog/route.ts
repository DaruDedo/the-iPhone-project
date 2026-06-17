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
import { getCollections, getIphoneModels, getProductCategories, getProducts } from "@/lib/catalog";
import { productTemplates } from "@/lib/product-templates";

type ProductPatchPayload = {
  productId?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  mrp?: number;
  tag?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  categoryId?: string;
  collectionId?: string;
  features?: string[];
  mediaUrls?: string[];
  stock?: number;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const [products, models, categories, collections] = await Promise.all([
    getProducts({ includeInactive: true }),
    getIphoneModels(),
    getProductCategories(),
    getCollections(),
  ]);

  return NextResponse.json({
    products,
    models,
    categories,
    collections,
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
    if (typeof payload.isFeatured === "boolean") {
      productUpdates.isFeatured = payload.isFeatured;
    }
    if (typeof payload.name === "string") {
      productUpdates.name = payload.name;
    }
    if (typeof payload.slug === "string") {
      productUpdates.slug = payload.slug;
    }
    if (typeof payload.description === "string") {
      productUpdates.description = payload.description;
    }
    if (typeof payload.tag === "string") {
      productUpdates.tag = payload.tag;
    }
    if (typeof payload.seoTitle === "string") {
      productUpdates.seoTitle = payload.seoTitle;
    }
    if (typeof payload.seoDescription === "string") {
      productUpdates.seoDescription = payload.seoDescription;
    }
    if (payload.categoryId) {
      productUpdates.categoryId = payload.categoryId;
    }
    if (payload.collectionId) {
      productUpdates.collectionId = payload.collectionId;
    }
    if (typeof payload.price === "number" && payload.price > 0) {
      productUpdates.price = payload.price;
    }
    if (typeof payload.mrp === "number" && payload.mrp > 0) {
      productUpdates.mrp = payload.mrp;
    }

    if (Object.keys(productUpdates).length > 1) {
      await db
        .update(schema.products)
        .set(productUpdates)
        .where(eq(schema.products.id, payload.productId));
    } else if (typeof payload.isActive === "boolean") {
      await setProductActive(db, payload.productId, payload.isActive);
    }

    // Sync variant pricing
    if (
      (typeof payload.price === "number" && payload.price > 0) ||
      (typeof payload.mrp === "number" && payload.mrp > 0)
    ) {
      const variantUpdates: { price?: number; mrp?: number; updatedAt: Date } = {
        updatedAt: new Date(),
      };
      if (typeof payload.price === "number" && payload.price > 0)
        variantUpdates.price = payload.price;
      if (typeof payload.mrp === "number" && payload.mrp > 0) variantUpdates.mrp = payload.mrp;

      await db
        .update(schema.productVariants)
        .set(variantUpdates)
        .where(eq(schema.productVariants.productId, payload.productId));
    }

    // Sync stock
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

    // Sync features
    if (payload.features && Array.isArray(payload.features)) {
      await db
        .delete(schema.productFeatures)
        .where(eq(schema.productFeatures.productId, payload.productId));
      if (payload.features.length > 0) {
        await db.insert(schema.productFeatures).values(
          payload.features.map((featureLabel, idx) => ({
            productId: payload.productId!,
            label: featureLabel,
            sortOrder: idx,
          })),
        );
      }
    }

    // Append new media/images to the product gallery
    if (payload.mediaUrls && Array.isArray(payload.mediaUrls) && payload.mediaUrls.length > 0) {
      const existingImages = await db.query.productImages.findMany({
        where: eq(schema.productImages.productId, payload.productId),
        orderBy: (images, { desc }) => [desc(images.sortOrder)],
      });
      const nextSortOrder = (existingImages[0]?.sortOrder ?? 0) + 1;

      await db.insert(schema.productImages).values(
        payload.mediaUrls.map((url, index) => ({
          productId: payload.productId!,
          url,
          alt: `${payload.name ?? "Product"} media ${nextSortOrder + index}`,
          sortOrder: nextSortOrder + index,
          isPrimary: false,
        })),
      );
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
    const product = uuidPattern.test(productId)
      ? await db.query.products.findFirst({
          where: eq(schema.products.id, productId),
        })
      : await db.query.products.findFirst({
          where: eq(schema.products.slug, productId),
        });

    if (!product) {
      return NextResponse.json({ ok: true, notFound: true });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(schema.orderItems)
        .set({
          productId: null,
          variantId: null,
          iphoneModelId: null,
        })
        .where(eq(schema.orderItems.productId, product.id));

      await tx.delete(schema.productReviews).where(eq(schema.productReviews.productId, product.id));
      await tx.delete(schema.productImages).where(eq(schema.productImages.productId, product.id));
      await tx
        .delete(schema.productFeatures)
        .where(eq(schema.productFeatures.productId, product.id));
      await tx
        .delete(schema.productModelInventory)
        .where(eq(schema.productModelInventory.productId, product.id));
      await tx
        .delete(schema.productVariants)
        .where(eq(schema.productVariants.productId, product.id));
      await tx.delete(schema.products).where(eq(schema.products.id, product.id));
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete product." },
      { status: 500 },
    );
  }
}
