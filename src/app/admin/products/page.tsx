"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { formatPrice, type IphoneModel, type Product, type ProductCategory } from "@/data/products";
import { nameFromFilename, slugifyProduct, type ProductTemplate } from "@/lib/product-templates";
import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";

type AdminOrderItem = {
  id: string;
  product_name: string;
  model_name: string;
  sku: string;
  quantity: number;
  line_total: number;
};

type AdminOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  payment_method: "COD" | "UPI";
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  created_at: string;
  order_items: AdminOrderItem[];
};

type CatalogResponse = {
  products: Product[];
  models: IphoneModel[];
  categories: ProductCategory[];
  templates: ProductTemplate[];
  devMode?: boolean;
};

type BulkRow = {
  id: string;
  file: File;
  name: string;
  slug: string;
};

const orderStatuses = ["new", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const modelFreeCategories = ["magsafe-wallets", "accessories"];

function getDefaultModelSlugs(models: IphoneModel[]) {
  const popular = models.filter((model) => model.isPopular).map((model) => model.slug);
  return popular.length ? popular : models.slice(0, 4).map((model) => model.slug);
}

function uniqueUploadPath(prefix: string, filename: string) {
  return `${prefix}/${Date.now()}-${Math.random().toString(16).slice(2)}-${filename.replace(
    /[^a-zA-Z0-9.]/g,
    "-",
  )}`;
}

export default function AdminPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("covers-cases");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
  const [selectedModelSlugs, setSelectedModelSlugs] = useState<string[]>([]);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);

  const categories = useMemo(() => catalog?.categories ?? [], [catalog]);
  const models = useMemo(() => catalog?.models ?? [], [catalog]);
  const templates = useMemo(() => catalog?.templates ?? [], [catalog]);
  const categoryTemplates = useMemo(
    () => templates.filter((template) => template.categorySlug === selectedCategorySlug),
    [templates, selectedCategorySlug],
  );
  const selectedTemplate =
    categoryTemplates.find((template) => template.key === selectedTemplateKey) ??
    categoryTemplates[0];
  const requiresModelFit =
    selectedTemplate?.requiresModelFit ?? !modelFreeCategories.includes(selectedCategorySlug);

  const getHeaders = useCallback(async (): Promise<Record<string, string> | null> => {
    const supabase = await getSupabaseBrowserClientAsync();

    if (!supabase) {
      return {};
    }

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/admin/login");
      return null;
    }

    return {
      Authorization: `Bearer ${data.session.access_token}`,
    };
  }, [router]);

  const loadAdminData = useCallback(async () => {
    const headers = await getHeaders();

    if (!headers) {
      return;
    }

    const [catalogResponse, ordersResponse] = await Promise.all([
      fetch("/api/admin/catalog", { headers }),
      fetch("/api/admin/orders", { headers }),
    ]);

    if (catalogResponse.status === 401 || catalogResponse.status === 403) {
      router.push("/admin/login");
      return;
    }

    const catalogJson = (await catalogResponse.json()) as CatalogResponse & { error?: string };
    const ordersJson = (await ordersResponse.json()) as { orders?: AdminOrder[]; error?: string };

    if (!catalogResponse.ok) {
      setError(catalogJson.error ?? "Could not load admin catalog.");
      return;
    }

    setCatalog(catalogJson);
    setOrders(ordersJson.orders ?? []);
  }, [getHeaders, router]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    if (!selectedTemplateKey && categoryTemplates[0]) {
      setSelectedTemplateKey(categoryTemplates[0].key);
    }

    if (
      selectedTemplateKey &&
      categoryTemplates.length > 0 &&
      !categoryTemplates.some((template) => template.key === selectedTemplateKey)
    ) {
      setSelectedTemplateKey(categoryTemplates[0].key);
    }
  }, [categoryTemplates, selectedTemplateKey]);

  useEffect(() => {
    if (!requiresModelFit && selectedModelSlugs.length > 0) {
      setSelectedModelSlugs([]);
    }
  }, [requiresModelFit, selectedModelSlugs.length]);

  async function uploadFile(prefix: string, file: File) {
    const supabase = await getSupabaseBrowserClientAsync();

    if (!supabase) {
      throw new Error("Supabase client is not configured for uploads.");
    }

    const path = uniqueUploadPath(prefix, file.name);
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  function toggleModel(slug: string) {
    setSelectedModelSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }

  function buildMediaUrls(form: FormData) {
    const reelUrl = String(form.get("instagramReelUrl") ?? "").trim();
    const pastedUrls = String(form.get("mediaUrls") ?? "")
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter(Boolean);

    return reelUrl ? [...pastedUrls, reelUrl] : pastedUrls;
  }

  async function uploadExtraMedia(form: FormData, mediaUrls: string[]) {
    const mediaFiles = form.getAll("mediaFiles");

    for (const mediaFile of mediaFiles) {
      if (!(mediaFile instanceof File) || mediaFile.size === 0) {
        continue;
      }

      mediaUrls.push(await uploadFile("products/media", mediaFile));
    }
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const headers = await getHeaders();

      if (!headers) {
        return;
      }

      const form = new FormData(formElement);
      let imageUrl = String(form.get("imageUrl") ?? "").trim();
      const imageFile = form.get("imageFile");
      const mediaUrls = buildMediaUrls(form);

      if (imageFile instanceof File && imageFile.size > 0) {
        imageUrl = await uploadFile("products", imageFile);
      }

      await uploadExtraMedia(form, mediaUrls);
      const price = Number(form.get("price") || selectedTemplate?.defaultPrice || 0);

      const response = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.get("name"),
          slug: form.get("slug"),
          categorySlug: selectedCategorySlug,
          templateKey: selectedTemplate?.key,
          defaultModelSlug: selectedModelSlugs[0],
          availableModelSlugs: selectedModelSlugs,
          requiresModelFit,
          description: form.get("description"),
          price,
          mrp: price,
          tag: form.get("tag") || selectedTemplate?.defaultTag,
          imageUrl,
          mediaUrls,
          features: form.get("features"),
          seoTitle: form.get("seoTitle"),
          seoDescription: form.get("seoDescription"),
          stock: Number(form.get("stock") || 25),
          isActive: true,
        }),
      });
      const result = (await response.json()) as { error?: string; slug?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not create product.");
      }

      formElement.reset();
      setMessage(`Product ${result.slug ?? ""} created with template defaults.`);
      await loadAdminData();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBulkFiles(files: FileList | null) {
    const nextRows = Array.from(files ?? []).map((file) => {
      const name = nameFromFilename(file.name);

      return {
        id: `${file.name}-${file.lastModified}-${Math.random().toString(16).slice(2)}`,
        file,
        name,
        slug: slugifyProduct(name),
      };
    });

    setBulkRows(nextRows);
  }

  function updateBulkRow(id: string, field: "name" | "slug", value: string) {
    setBulkRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              ...(field === "name" ? { slug: slugifyProduct(value) } : {}),
            }
          : row,
      ),
    );
  }

  async function handleBulkCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setMessage("");
    setIsBulkSubmitting(true);

    try {
      if (bulkRows.length === 0) {
        throw new Error("Upload product images before bulk create.");
      }

      const headers = await getHeaders();

      if (!headers) {
        return;
      }

      const form = new FormData(formElement);
      const sharedReel = String(form.get("bulkInstagramReelUrl") ?? "").trim();
      const bulkPrice = Number(form.get("bulkPrice") || selectedTemplate?.defaultPrice || 0);
      const products = [];

      for (const row of bulkRows) {
        products.push({
          name: row.name,
          slug: row.slug,
          categorySlug: selectedCategorySlug,
          templateKey: selectedTemplate?.key,
          defaultModelSlug: selectedModelSlugs[0],
          availableModelSlugs: selectedModelSlugs,
          requiresModelFit,
          price: bulkPrice,
          mrp: bulkPrice,
          tag: form.get("bulkTag") || selectedTemplate?.defaultTag,
          imageUrl: await uploadFile("products", row.file),
          mediaUrls: sharedReel ? [sharedReel] : [],
          stock: Number(form.get("bulkStock") || 25),
          isActive: true,
        });
      }

      const response = await fetch("/api/admin/catalog/bulk", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products }),
      });
      const result = (await response.json()) as {
        error?: string;
        created?: Array<{ slug: string }>;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not create bulk products.");
      }

      setBulkRows([]);
      formElement.reset();
      setMessage(`${result.created?.length ?? 0} products created with AI-ready defaults.`);
      await loadAdminData();
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : "Could not create bulk products.");
    } finally {
      setIsBulkSubmitting(false);
    }
  }

  async function toggleProduct(product: Product) {
    const headers = await getHeaders();

    if (!headers) {
      return;
    }

    await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId: product.id, isActive: !product.isActive }),
    });
    await loadAdminData();
  }

  async function quickEditProduct(product: Product) {
    const priceInput = window.prompt("Price", String(product.price));

    if (priceInput === null) {
      return;
    }

    const tagInput = window.prompt("Badge/tag", product.tag ?? "");

    if (tagInput === null) {
      return;
    }

    const stockInput = window.prompt(
      "Stock for every variant",
      String(product.selectedModel?.stock ?? 25),
    );

    if (stockInput === null) {
      return;
    }

    const headers = await getHeaders();

    if (!headers) {
      return;
    }

    const response = await fetch("/api/admin/catalog", {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        price: Number(priceInput),
        tag: tagInput,
        stock: Number(stockInput),
      }),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Could not update product.");
      return;
    }

    setMessage(`${product.name} updated.`);
    await loadAdminData();
  }

  async function deleteProduct(product: Product) {
    if (
      !window.confirm(
        `Delete ${product.name}? This removes the product, variants, images, and reviews.`,
      )
    ) {
      return;
    }

    const headers = await getHeaders();

    if (!headers) {
      return;
    }

    const response = await fetch(`/api/admin/catalog?productId=${encodeURIComponent(product.id)}`, {
      method: "DELETE",
      headers,
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(result.error ?? "Could not delete product.");
      return;
    }

    setMessage(`${product.name} deleted.`);
    await loadAdminData();
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const headers = await getHeaders();

    if (!headers) {
      return;
    }

    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, status }),
    });
    await loadAdminData();
  }

  async function logout() {
    const supabase = await getSupabaseBrowserClientAsync();
    await supabase?.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-background px-3 py-10 text-foreground sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-4xl font-bold md:text-6xl">Product panel.</h1>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
            >
              Store
            </Link>
            <button
              className="rounded-full bg-foreground px-4 py-2 text-sm text-background"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        {catalog?.devMode && (
          <div className="mt-6 rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
            Database URL is not configured, so admin is showing fallback/dev data. Add DATABASE_URL
            before creating products.
          </div>
        )}
        {message && <div className="mt-6 rounded-2xl bg-muted/60 p-4 text-sm">{message}</div>}
        {error && (
          <div className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm text-foreground">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[460px_1fr]">
          <div className="grid h-fit gap-6">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold">Product engine</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Choose a category and template first. Empty description, features, FAQs, specs, and
                SEO fields are filled automatically on the storefront.
              </p>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product category
                  <select
                    value={selectedCategorySlug}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-none"
                    onChange={(event) => setSelectedCategorySlug(event.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.slug} value={category.slug}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Content template
                  <select
                    value={selectedTemplate?.key ?? ""}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm normal-case tracking-normal text-foreground outline-none"
                    onChange={(event) => setSelectedTemplateKey(event.target.value)}
                  >
                    {categoryTemplates.map((template) => (
                      <option key={template.key} value={template.key}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedTemplate && (
                  <div className="rounded-2xl bg-muted/50 p-4 text-xs leading-5 text-muted-foreground">
                    Default price: {formatPrice(selectedTemplate.defaultPrice)} /{" "}
                    {selectedTemplate.defaultTag}
                  </div>
                )}

                {requiresModelFit && (
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Available iPhone models
                      </p>
                      <button
                        type="button"
                        className="text-xs font-medium text-muted-foreground hover:text-foreground"
                        onClick={() => setSelectedModelSlugs(getDefaultModelSlugs(models))}
                      >
                        Popular
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {models.map((model) => {
                        const selected = selectedModelSlugs.includes(model.slug);

                        return (
                          <button
                            key={model.slug}
                            type="button"
                            className={`rounded-full border px-3 py-1.5 text-xs transition ${
                              selected
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-background text-foreground hover:border-foreground/40"
                            }`}
                            onClick={() => toggleModel(model.slug)}
                          >
                            {model.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <form
              className="h-fit rounded-3xl border border-border bg-card p-6"
              onSubmit={handleCreateProduct}
            >
              <h2 className="text-2xl font-bold">Add single product</h2>
              <div className="mt-5 grid gap-4">
                <input
                  name="name"
                  required
                  placeholder="Product name, e.g. Batman Cover"
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                <input
                  name="slug"
                  placeholder="slug-auto-if-empty"
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Optional. Leave blank for template description."
                  className="resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <input
                  name="price"
                  type="number"
                  placeholder={`Price ${selectedTemplate?.defaultPrice ?? ""}`}
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="tag"
                    placeholder={`Tag ${selectedTemplate?.defaultTag ?? ""}`}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  />
                  <input
                    name="stock"
                    type="number"
                    placeholder="Stock per selected model"
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  />
                </div>
                <input
                  name="imageUrl"
                  placeholder="Primary image URL or upload below"
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                <input
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <textarea
                  name="mediaUrls"
                  rows={3}
                  placeholder="Extra media URLs: images, MP4/WebM, YouTube-style video URL"
                  className="resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <input
                  name="instagramReelUrl"
                  placeholder="Instagram Reel URL"
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                <input
                  name="mediaFiles"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <input
                  name="features"
                  placeholder="Optional features. Leave blank for template."
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                <input
                  name="seoTitle"
                  placeholder="Optional SEO title. Leave blank for AI-ready default."
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                <textarea
                  name="seoDescription"
                  rows={2}
                  placeholder="Optional SEO description. Leave blank for template."
                  className="resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <button
                  disabled={isSubmitting}
                  className="h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background"
                >
                  {isSubmitting ? "Saving..." : "Create product"}
                </button>
              </div>
            </form>

            <form
              className="h-fit rounded-3xl border border-border bg-card p-6"
              onSubmit={handleBulkCreate}
            >
              <h2 className="text-2xl font-bold">Bulk add products</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Upload 10-20 primary images. Filenames become product names, and the template fills
                content, specs, FAQs, reviews, and SEO defaults.
              </p>
              <div className="mt-5 grid gap-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                  onChange={(event) => handleBulkFiles(event.target.files)}
                />
                <input
                  name="bulkPrice"
                  type="number"
                  placeholder={`Price ${selectedTemplate?.defaultPrice ?? ""}`}
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    name="bulkTag"
                    placeholder={`Tag ${selectedTemplate?.defaultTag ?? ""}`}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  />
                  <input
                    name="bulkStock"
                    type="number"
                    placeholder="Stock per selected model"
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                  />
                </div>
                <input
                  name="bulkInstagramReelUrl"
                  placeholder="Shared Instagram Reel URL, optional"
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
                {bulkRows.length > 0 && (
                  <div className="grid gap-2">
                    {bulkRows.map((row) => (
                      <div key={row.id} className="grid gap-2 rounded-2xl bg-muted/50 p-3">
                        <input
                          value={row.name}
                          className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"
                          onChange={(event) => updateBulkRow(row.id, "name", event.target.value)}
                        />
                        <input
                          value={row.slug}
                          className="h-10 rounded-xl border border-border bg-background px-3 text-xs text-muted-foreground outline-none"
                          onChange={(event) => updateBulkRow(row.id, "slug", event.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <button
                  disabled={isBulkSubmitting || bulkRows.length === 0}
                  className="h-11 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50"
                >
                  {isBulkSubmitting ? "Creating..." : `Create ${bulkRows.length || ""} products`}
                </button>
              </div>
            </form>
          </div>

          <div className="grid gap-6">
            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold">Products</h2>
              <div className="mt-5 grid gap-3">
                {(catalog?.products ?? []).map((product) => (
                  <article
                    key={product.id}
                    className="grid grid-cols-[64px_1fr_auto] gap-4 rounded-2xl border border-border p-3"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={product.image.url}
                        alt={product.image.alt}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{product.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.category} / {formatPrice(product.price)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {product.requiresModelFit
                          ? `${product.modelOptions.filter((model) => model.isAvailable).length} active variants`
                          : "Universal variant"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/products/${product.categorySlug}/${product.slug}`}
                        className="h-9 rounded-full border border-border px-3 text-center text-xs leading-9 transition hover:border-foreground/35"
                      >
                        View
                      </Link>
                      <button
                        className="h-9 rounded-full border border-border px-3 text-xs"
                        onClick={() => quickEditProduct(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="h-9 rounded-full border border-border px-3 text-xs"
                        onClick={() => toggleProduct(product)}
                      >
                        {product.isActive ? "Active" : "Hidden"}
                      </button>
                      <button
                        className="h-9 rounded-full border border-destructive/30 px-3 text-xs text-destructive"
                        onClick={() => deleteProduct(product)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-2xl font-bold">Orders</h2>
              <div className="mt-5 grid gap-3">
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  orders.map((order) => (
                    <article key={order.id} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">{order.order_number}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.customer_name} / {order.phone} / {order.payment_method}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold">
                            {formatPrice(order.total)}
                          </span>
                          <select
                            value={order.status}
                            className="h-9 rounded-full border border-border bg-background px-3 text-xs outline-none"
                            onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                          >
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                        {order.order_items.map((item) => (
                          <p key={item.id}>
                            {item.quantity}x {item.product_name} for {item.model_name} / {item.sku}
                          </p>
                        ))}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
