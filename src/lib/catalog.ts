import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import {
  collections as fallbackCollections,
  getCollectionBySlug as getFallbackCollectionBySlug,
  getIphoneModelBySlug,
  iphoneModels as fallbackIphoneModels,
  products as fallbackProducts,
  productCategories as fallbackProductCategories,
  type Collection,
  type IphoneModel,
  type Product,
  type ProductCategory,
  type ProductImage,
  type ProductModelOption,
} from "@/data/products";
import { getInstagramEmbedUrl, inferProductMediaKind } from "@/lib/product-media";

type DbCollection = typeof schema.collections.$inferSelect;
type DbProductCategory = typeof schema.productCategories.$inferSelect;
type DbIphoneModel = typeof schema.iphoneModels.$inferSelect;
type DbImage = typeof schema.productImages.$inferSelect;
type DbFeature = typeof schema.productFeatures.$inferSelect;
type DbVariant = typeof schema.productVariants.$inferSelect & {
  iphoneModel: DbIphoneModel | null;
};
type DbInventory = typeof schema.productModelInventory.$inferSelect & {
  iphoneModel: DbIphoneModel | null;
};
type DbReview = typeof schema.productReviews.$inferSelect;
type DbProduct = typeof schema.products.$inferSelect & {
  collection: DbCollection | null;
  category: DbProductCategory | null;
  defaultIphoneModel?: DbIphoneModel | null;
  images: DbImage[];
  features: DbFeature[];
  variants?: DbVariant[];
  inventory?: DbInventory[];
  reviews?: DbReview[];
};

type MappedModelOption = ProductModelOption & {
  isDefault?: boolean;
  sortOrder: number;
};

const seedDefaultModelBySlug: Record<string, string> = {
  "cosmic-orange-frosted-air": "iphone-17-pro",
  "sky-blue-frosted-air": "iphone-17",
  "lavender-frosted-air": "iphone-air",
  "blush-pink-frosted-air": "iphone-17",
  "space-black-frosted-air": "iphone-16-pro-max",
  "arctic-clear-frosted-air": "iphone-16-pro",
  "mist-purple-frosted-air": "iphone-15-pro",
  "rose-crystal-frosted-air": "iphone-15",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function bySortOrder<T extends { sortOrder?: number; sort_order?: number | null }>(a: T, b: T) {
  return (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0);
}

function getSafeImageUrl(productSlug: string, url: string) {
  if (!url.includes("/seed/")) {
    return url;
  }

  return fallbackProducts.find((product) => product.slug === productSlug)?.image.url ?? url;
}

function mapCollection(row: DbCollection, count?: string): Collection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    desc: row.description ?? "",
    count: count ?? "iPhone accessories",
    sortOrder: row.sortOrder ?? 0,
    isActive: row.isActive ?? true,
  };
}

function mapProductCategory(row: DbProductCategory): ProductCategory {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    desc: row.description ?? "",
    sortOrder: row.sortOrder ?? 0,
    isActive: row.isActive ?? true,
  };
}

function mapIphoneModel(row: DbIphoneModel): IphoneModel {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    generation: row.generation ?? 0,
    sortOrder: row.sortOrder ?? 0,
    isPopular: row.isPopular ?? false,
    isActive: row.isActive ?? true,
  };
}

function mapImages(productSlug: string, productName: string, images: DbImage[]) {
  return images
    .map<ProductImage>((image) => {
      const url = getSafeImageUrl(productSlug, image.url);
      const kind = inferProductMediaKind(url);

      return {
        id: image.id,
        url,
        alt: image.alt ?? `${productName} iPhone cover`,
        sortOrder: image.sortOrder ?? 0,
        isPrimary: image.isPrimary ?? false,
        kind,
        embedUrl: getInstagramEmbedUrl(url),
      };
    })
    .sort(bySortOrder);
}

function mapVariantOptions(row: DbProduct): MappedModelOption[] {
  const variants = row.variants ?? [];

  if (variants.length > 0) {
    return variants
      .map<MappedModelOption | null>((variant) => {
        const model = variant.iphoneModel;

        if (row.requiresModelFit && (!model || model.isActive === false)) {
          return null;
        }

        const fallbackLabel = variant.variantLabel ?? variant.title ?? "Universal";
        const name = model?.name ?? fallbackLabel;
        const slug = model?.slug ?? slugify(fallbackLabel || "universal");

        return {
          id: model?.id ?? variant.id,
          variantId: variant.id,
          name,
          slug,
          sku: variant.sku,
          price: variant.price,
          mrp: variant.mrp,
          stock: variant.stock ?? 0,
          isAvailable: variant.isAvailable !== false && (variant.stock ?? 0) > 0,
          isDefault: variant.isDefault,
          sortOrder: model?.sortOrder ?? variant.sortOrder ?? 0,
        };
      })
      .filter((model): model is MappedModelOption => Boolean(model))
      .sort(bySortOrder);
  }

  return (row.inventory ?? [])
    .map<MappedModelOption | null>((inventory) => {
      const model = inventory.iphoneModel;

      if (!model || model.isActive === false) {
        return null;
      }

      return {
        id: model.id,
        inventoryId: inventory.id,
        name: model.name,
        slug: model.slug,
        sku: inventory.sku ?? `${row.slug}-${model.slug}`,
        price: row.price,
        mrp: row.mrp,
        stock: inventory.stock ?? 0,
        isAvailable: inventory.isAvailable !== false && (inventory.stock ?? 0) > 0,
        isDefault: row.defaultIphoneModelId === model.id,
        sortOrder: model.sortOrder ?? 0,
      };
    })
    .filter((model): model is MappedModelOption => Boolean(model))
    .sort(bySortOrder);
}

function getDefaultOption(row: DbProduct, modelOptions: MappedModelOption[]) {
  const fallbackProduct = fallbackProducts.find((product) => product.slug === row.slug);
  const defaultModelSlug =
    row.defaultIphoneModel?.slug ??
    fallbackProduct?.defaultModelSlug ??
    seedDefaultModelBySlug[row.slug];

  return (
    modelOptions.find((model) => model.isAvailable && model.isDefault) ??
    modelOptions.find((model) => model.isAvailable && model.slug === defaultModelSlug) ??
    modelOptions.find((model) => model.isAvailable) ??
    modelOptions[0]
  );
}

function mapProduct(row: DbProduct): Product {
  const collection = row.collection;
  const category = row.category;
  const images = mapImages(row.slug, row.name, row.images ?? []);
  const fallbackImage =
    fallbackProducts.find((product) => product.slug === row.slug)?.image ??
    fallbackProducts[0].image;
  const image =
    images.find((item) => item.isPrimary && item.kind === "image") ??
    images.find((item) => item.kind === "image") ??
    fallbackImage;
  const modelOptions = mapVariantOptions(row);
  const availableModels = modelOptions.filter((model) => model.isAvailable);
  const defaultOption = getDefaultOption(row, modelOptions);
  const productPrice = defaultOption?.price ?? row.price;
  const productMrp = defaultOption?.mrp ?? row.mrp;
  const collectionTitle = collection?.title ?? "The iPhone Project";
  const categoryTitle = category?.title ?? "Covers & Cases";

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: categoryTitle,
    categorySlug: category?.slug ?? "covers-cases",
    requiresModelFit: row.requiresModelFit ?? true,
    defaultModelSlug: defaultOption?.slug ?? "",
    collection: collectionTitle,
    collectionSlug: collection?.slug ?? "frosted-air",
    model: row.requiresModelFit
      ? `${row.name} for ${defaultOption?.name ?? availableModels[0]?.name ?? "iPhone"}`
      : categoryTitle,
    price: productPrice,
    mrp: productMrp,
    image,
    images: images.length > 0 ? images : [image],
    tint: "var(--orange-tint)",
    tag: row.tag ?? "New",
    rating:
      row.reviews && row.reviews.filter((r) => r.isApproved).length > 0
        ? Number(
            (
              row.reviews.filter((r) => r.isApproved).reduce((sum, r) => sum + r.rating, 0) /
              row.reviews.filter((r) => r.isApproved).length
            ).toFixed(1),
          )
        : 4.9,
    reviews:
      row.reviews && row.reviews.filter((r) => r.isApproved).length > 0
        ? row.reviews.filter((r) => r.isApproved).length
        : 12, // fallback count for aesthetic trust
    description: row.description ?? "",
    colors: [],
    models: availableModels.map((model) => model.name),
    modelOptions: availableModels,
    selectedModel: defaultOption,
    features: (row.features ?? []).sort(bySortOrder).map((feature) => feature.label),
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    isActive: row.isActive ?? true,
    isFeatured: row.isFeatured ?? false,
    sortOrder: row.sortOrder ?? 0,
  };
}

async function fetchProductsWithVariants(options: { includeInactive?: boolean } = {}) {
  const db = getDb();

  if (!db) {
    return null;
  }

  const rows = (await db.query.products.findMany({
    where: options.includeInactive ? undefined : (products, { eq }) => eq(products.isActive, true),
    orderBy: (products, { asc }) => [asc(products.sortOrder)],
    with: {
      collection: true,
      category: true,
      defaultIphoneModel: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.sortOrder)],
      },
      features: {
        orderBy: (features, { asc }) => [asc(features.sortOrder)],
      },
      variants: {
        orderBy: (variants, { asc }) => [asc(variants.sortOrder)],
        with: {
          iphoneModel: true,
        },
      },
      reviews: true,
    },
  })) as unknown as DbProduct[];

  return rows.map(mapProduct).filter((product) => options.includeInactive || product.isActive);
}

async function fetchProductsWithLegacyInventory(options: { includeInactive?: boolean } = {}) {
  const db = getDb();

  if (!db) {
    return null;
  }

  const rows = (await db.query.products.findMany({
    where: options.includeInactive ? undefined : (products, { eq }) => eq(products.isActive, true),
    orderBy: (products, { asc }) => [asc(products.sortOrder)],
    with: {
      collection: true,
      category: true,
      defaultIphoneModel: true,
      images: {
        orderBy: (images, { asc }) => [asc(images.sortOrder)],
      },
      features: {
        orderBy: (features, { asc }) => [asc(features.sortOrder)],
      },
      inventory: {
        with: {
          iphoneModel: true,
        },
      },
      reviews: true,
    },
  })) as unknown as DbProduct[];

  return rows.map(mapProduct).filter((product) => options.includeInactive || product.isActive);
}

async function fetchDrizzleProducts(options: { includeInactive?: boolean } = {}) {
  try {
    return await fetchProductsWithVariants(options);
  } catch (error) {
    console.warn(
      "Drizzle product variants are not ready, trying legacy inventory:",
      error instanceof Error ? error.message : error,
    );
  }

  try {
    return await fetchProductsWithLegacyInventory(options);
  } catch (error) {
    console.warn(
      "Falling back to static products:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function fetchDrizzleCollections() {
  const db = getDb();

  if (!db) {
    return null;
  }

  try {
    const rows = await db.query.collections.findMany({
      where: (collections, { eq }) => eq(collections.isActive, true),
      orderBy: (collections, { asc }) => [asc(collections.sortOrder)],
    });

    return rows.map((collection) => mapCollection(collection));
  } catch (error) {
    console.warn(
      "Falling back to static collections:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function fetchDrizzleProductCategories() {
  const db = getDb();

  if (!db) {
    return null;
  }

  try {
    const rows = await db.query.productCategories.findMany({
      where: (categories, { eq }) => eq(categories.isActive, true),
      orderBy: (categories, { asc }) => [asc(categories.sortOrder)],
    });

    return rows.map(mapProductCategory);
  } catch {
    return null;
  }
}

async function fetchDrizzleIphoneModels() {
  const db = getDb();

  if (!db) {
    return null;
  }

  try {
    const rows = await db.query.iphoneModels.findMany({
      where: (models, { eq }) => eq(models.isActive, true),
      orderBy: (models, { asc }) => [asc(models.sortOrder)],
    });

    return rows.map(mapIphoneModel);
  } catch (error) {
    console.warn(
      "Falling back to static iPhone models:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function getCollections() {
  return (await fetchDrizzleCollections()) ?? fallbackCollections;
}

export async function getProductCategories() {
  return (await fetchDrizzleProductCategories()) ?? fallbackProductCategories;
}

export async function getProductCategoryBySlug(slug: string) {
  const categories = await getProductCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getCollectionBySlug(slug: string) {
  const collections = await getCollections();
  return (
    collections.find((collection) => collection.slug === slug) ?? getFallbackCollectionBySlug(slug)
  );
}

export async function getIphoneModels() {
  return (await fetchDrizzleIphoneModels()) ?? fallbackIphoneModels;
}

export async function getProducts(options: { includeInactive?: boolean } = {}) {
  const dbProducts = await fetchDrizzleProducts(options);
  if (!dbProducts) {
    return fallbackProducts;
  }
  const dbSlugs = new Set(dbProducts.map((p) => p.slug));
  const missingFallbacks = fallbackProducts.filter((p) => !dbSlugs.has(p.slug));
  return [...dbProducts, ...missingFallbacks];
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug);
}

export async function getProductsByCollection(slug: string) {
  const products = await getProducts();
  return products.filter((product) => product.collectionSlug === slug);
}

export async function getProductsByCategory(slug: string) {
  const products = await getProducts();
  return products.filter((product) => product.categorySlug === slug);
}

export async function getProductsByModel(modelSlug: string) {
  const products = await getProducts();

  return products.flatMap((product) => {
    if (!product.requiresModelFit) {
      return [];
    }

    const selectedModel = product.modelOptions.find(
      (model) => model.slug === modelSlug && model.isAvailable,
    );

    if (!selectedModel) {
      return [];
    }

    return [
      {
        ...product,
        price: selectedModel.price ?? product.price,
        mrp: selectedModel.mrp ?? product.mrp,
        selectedModel,
        model: `${product.name} for ${selectedModel.name}`,
      },
    ];
  });
}
