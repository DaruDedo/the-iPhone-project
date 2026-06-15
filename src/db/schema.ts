import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const adminUsers = pgTable("admin_users", {
  email: text("email").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productCategories = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const iphoneModels = pgTable("iphone_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  generation: integer("generation").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPopular: boolean("is_popular").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  categoryId: uuid("category_id").references(() => productCategories.id, {
    onDelete: "restrict",
  }),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "restrict" }),
  defaultIphoneModelId: uuid("default_iphone_model_id").references(() => iphoneModels.id, {
    onDelete: "set null",
  }),
  requiresModelFit: boolean("requires_model_fit").notNull().default(true),
  description: text("description"),
  price: integer("price").notNull(),
  mrp: integer("mrp").notNull(),
  tag: text("tag"),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    iphoneModelId: uuid("iphone_model_id").references(() => iphoneModels.id, {
      onDelete: "set null",
    }),
    sku: text("sku").notNull().unique(),
    title: text("title"),
    variantLabel: text("variant_label"),
    price: integer("price").notNull(),
    mrp: integer("mrp").notNull(),
    stock: integer("stock").notNull().default(0),
    isAvailable: boolean("is_available").notNull().default(true),
    isDefault: boolean("is_default").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("product_variants_product_model_label_unique").on(
      table.productId,
      table.iphoneModelId,
      table.variantLabel,
    ),
  ],
);

export const productImages = pgTable("product_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, {
    onDelete: "set null",
  }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productFeatures = pgTable("product_features", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const productModelInventory = pgTable(
  "product_model_inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    iphoneModelId: uuid("iphone_model_id")
      .notNull()
      .references(() => iphoneModels.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    stock: integer("stock").notNull().default(0),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("product_model_inventory_product_model_unique").on(table.productId, table.iphoneModelId),
  ],
);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  address: text("address").notNull(),
  pincode: text("pincode").notNull(),
  paymentMethod: text("payment_method").notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  iphoneModelId: uuid("iphone_model_id").references(() => iphoneModels.id, {
    onDelete: "set null",
  }),
  productName: text("product_name").notNull(),
  modelName: text("model_name").notNull(),
  sku: text("sku").notNull(),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: integer("line_total").notNull(),
});

export const collectionsRelations = relations(collections, ({ many }) => ({
  products: many(products),
}));

export const productCategoriesRelations = relations(productCategories, ({ many }) => ({
  products: many(products),
}));

export const iphoneModelsRelations = relations(iphoneModels, ({ many }) => ({
  defaultProducts: many(products),
  variants: many(productVariants),
  inventory: many(productModelInventory),
  orderItems: many(orderItems),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  collection: one(collections, {
    fields: [products.collectionId],
    references: [collections.id],
  }),
  defaultIphoneModel: one(iphoneModels, {
    fields: [products.defaultIphoneModelId],
    references: [iphoneModels.id],
  }),
  images: many(productImages),
  features: many(productFeatures),
  variants: many(productVariants),
  inventory: many(productModelInventory),
  orderItems: many(orderItems),
  reviews: many(productReviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  iphoneModel: one(iphoneModels, {
    fields: [productVariants.iphoneModelId],
    references: [iphoneModels.id],
  }),
  images: many(productImages),
  orderItems: many(orderItems),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [productImages.variantId],
    references: [productVariants.id],
  }),
}));

export const productFeaturesRelations = relations(productFeatures, ({ one }) => ({
  product: one(products, {
    fields: [productFeatures.productId],
    references: [products.id],
  }),
}));

export const productModelInventoryRelations = relations(productModelInventory, ({ one }) => ({
  product: one(products, {
    fields: [productModelInventory.productId],
    references: [products.id],
  }),
  iphoneModel: one(iphoneModels, {
    fields: [productModelInventory.iphoneModelId],
    references: [iphoneModels.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
  iphoneModel: one(iphoneModels, {
    fields: [orderItems.iphoneModelId],
    references: [iphoneModels.id],
  }),
}));

export const productReviews = pgTable("product_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  city: text("city").notNull().default(""),
  rating: integer("rating").notNull(),
  quote: text("quote").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
}));
