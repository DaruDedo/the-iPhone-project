import { eq } from "drizzle-orm";

import type { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import {
  applyProductTemplate,
  getProductTemplate,
  slugifyProduct,
  type ProductTemplateKey,
} from "@/lib/product-templates";

type CatalogDb = NonNullable<ReturnType<typeof getDb>>;

export type AdminProductPayload = {
  name?: string;
  slug?: string;
  categorySlug?: string;
  defaultModelSlug?: string;
  availableModelSlugs?: string[] | string;
  requiresModelFit?: boolean;
  templateKey?: ProductTemplateKey | string;
  description?: string;
  price?: number;
  mrp?: number;
  tag?: string;
  imageUrl?: string;
  mediaUrls?: string[] | string;
  features?: string[] | string;
  seoTitle?: string;
  seoDescription?: string;
  stock?: number;
  isActive?: boolean;
};

function skuPart(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function parseList(value?: string[] | string) {
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return (value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseFeatures(value?: string[] | string) {
  return parseList(value);
}

async function uniqueSlug(db: CatalogDb, requestedSlug: string) {
  const baseSlug = slugifyProduct(requestedSlug) || "product";
  let nextSlug = baseSlug;
  let suffix = 2;

  while (true) {
    const existing = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.slug, nextSlug),
    });

    if (!existing) {
      return nextSlug;
    }

    nextSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function defaultProductSlug(name: string, categorySlug: string) {
  const suffixByCategory: Record<string, string> = {
    "covers-cases": "iphone-cover",
    "tempered-glass": "tempered-glass",
    "camera-protection": "camera-lens-protector",
    "magsafe-wallets": "magsafe-wallet",
    accessories: "iphone-accessory",
  };
  const suffix = suffixByCategory[categorySlug] ?? "iphone-accessory";
  const base = slugifyProduct(name);

  return base.endsWith(suffix) ? base : `${base}-${suffix}`;
}

export async function createCatalogProduct(db: CatalogDb, payload: AdminProductPayload) {
  const name = payload.name?.trim();
  const categorySlug = payload.categorySlug || "covers-cases";
  const template = getProductTemplate(payload.templateKey, categorySlug);
  const price = Number(payload.price || template.defaultPrice);
  const mrp = Number(payload.mrp || price);
  const stock = Math.max(0, Number(payload.stock ?? 25));
  const requiresModelFit = payload.requiresModelFit ?? template.requiresModelFit;

  if (!name || !price || !payload.imageUrl) {
    throw new Error("Name, price, and image are required.");
  }

  const primaryImageUrl = payload.imageUrl.trim();
  const typedSlug = slugifyProduct(payload.slug ?? "");
  const plainNameSlug = slugifyProduct(name);
  const slug = await uniqueSlug(
    db,
    !typedSlug || typedSlug === plainNameSlug ? defaultProductSlug(name, categorySlug) : typedSlug,
  );
  const collection =
    (await db.query.collections.findFirst({
      where: (collections, { eq }) => eq(collections.slug, "frosted-air"),
    })) ??
    (await db.query.collections.findFirst({
      where: (collections, { eq }) => eq(collections.isActive, true),
      orderBy: (collections, { asc }) => [asc(collections.sortOrder)],
    }));
  const category = await db.query.productCategories.findFirst({
    where: (categories, { eq }) => eq(categories.slug, categorySlug),
  });

  if (!collection) {
    throw new Error(
      "Default product group not found. Run the catalog seed before adding products.",
    );
  }

  if (!category) {
    throw new Error("Category not found. Run the Drizzle variant migration first.");
  }

  const selectedModelSlugs = parseList(payload.availableModelSlugs);
  const activeModels = requiresModelFit
    ? await db.query.iphoneModels.findMany({
        where: (models, { eq }) => eq(models.isActive, true),
        orderBy: (models, { asc }) => [asc(models.sortOrder)],
      })
    : [];

  if (requiresModelFit && selectedModelSlugs.length === 0) {
    throw new Error("Select at least one iPhone model for this product.");
  }

  const modelsForVariants = requiresModelFit
    ? activeModels.filter((model) => selectedModelSlugs.includes(model.slug))
    : [];
  const defaultModel =
    modelsForVariants.find((model) => model.slug === payload.defaultModelSlug) ??
    modelsForVariants[0] ??
    null;
  const templateContent = applyProductTemplate(template, {
    productName: name,
    categoryTitle: category.title,
    modelNames: modelsForVariants.map((model) => model.name),
  });
  const features = parseFeatures(payload.features);
  const finalFeatures = features.length > 0 ? features : templateContent.features;
  const description = payload.description?.trim() || templateContent.description;
  const seoTitle = payload.seoTitle?.trim() || templateContent.seoTitle;
  const seoDescription = payload.seoDescription?.trim() || templateContent.seoDescription;
  const mediaUrls = parseList(payload.mediaUrls);

  return db.transaction(async (tx) => {
    const [createdProduct] = await tx
      .insert(schema.products)
      .values({
        slug,
        name,
        collectionId: collection.id,
        categoryId: category.id,
        defaultIphoneModelId: requiresModelFit ? (defaultModel?.id ?? null) : null,
        requiresModelFit,
        description,
        price,
        mrp,
        tag: payload.tag?.trim() || template.defaultTag,
        isActive: payload.isActive ?? true,
        isFeatured: true,
        sortOrder: 999,
        seoTitle,
        seoDescription,
      })
      .returning({
        id: schema.products.id,
        slug: schema.products.slug,
      });

    if (!createdProduct) {
      throw new Error("Could not create product.");
    }

    await tx.insert(schema.productImages).values({
      productId: createdProduct.id,
      url: primaryImageUrl,
      alt: `${name} ${category.title} product image`,
      sortOrder: 1,
      isPrimary: true,
    });

    if (mediaUrls.length) {
      await tx.insert(schema.productImages).values(
        mediaUrls.map((url, index) => ({
          productId: createdProduct.id,
          url,
          alt: `${name} product media ${index + 1}`,
          sortOrder: index + 2,
          isPrimary: false,
        })),
      );
    }

    if (finalFeatures.length) {
      await tx.insert(schema.productFeatures).values(
        finalFeatures.map((feature, index) => ({
          productId: createdProduct.id,
          label: feature,
          sortOrder: index + 1,
        })),
      );
    }

    if (requiresModelFit) {
      if (modelsForVariants.length === 0) {
        throw new Error("Select at least one iPhone model for this product.");
      }

      await tx.insert(schema.productVariants).values(
        modelsForVariants.map((model) => ({
          productId: createdProduct.id,
          iphoneModelId: model.id,
          sku: `${skuPart(slug)}-${skuPart(model.slug)}`,
          title: `${name} for ${model.name}`,
          variantLabel: model.name,
          price,
          mrp,
          stock,
          isAvailable: stock > 0,
          isDefault: model.id === defaultModel?.id,
          sortOrder: model.sortOrder,
        })),
      );

      await tx.insert(schema.productModelInventory).values(
        modelsForVariants.map((model) => ({
          productId: createdProduct.id,
          iphoneModelId: model.id,
          sku: `${skuPart(slug)}-${skuPart(model.slug)}-LEGACY`,
          stock,
          isAvailable: stock > 0,
        })),
      );
    } else {
      await tx.insert(schema.productVariants).values({
        productId: createdProduct.id,
        iphoneModelId: null,
        sku: skuPart(slug),
        title: name,
        variantLabel: "Universal",
        price,
        mrp,
        stock,
        isAvailable: stock > 0,
        isDefault: true,
        sortOrder: 1,
      });
    }

    return createdProduct;
  });
}

export async function setProductActive(db: CatalogDb, productId: string, isActive: boolean) {
  await db
    .update(schema.products)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(schema.products.id, productId));
}
