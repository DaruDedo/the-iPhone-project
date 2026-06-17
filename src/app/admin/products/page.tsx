"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  formatPrice,
  type IphoneModel,
  type Product,
  type ProductCategory,
  type Collection,
} from "@/data/products";
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
  collections: Collection[];
  templates: ProductTemplate[];
  devMode?: boolean;
};

type BulkRow = {
  id: string;
  file: File;
  name: string;
  slug: string;
};

type UploadProgress = {
  done: number;
  total: number;
  fileName: string;
} | null;

const orderStatuses = ["new", "confirmed", "packed", "shipped", "delivered", "cancelled"];
const modelFreeCategories = ["magsafe-wallets", "accessories"];

function getUploadFiles(form: FormData, name: string) {
  return form.getAll(name).filter((file): file is File => file instanceof File && file.size > 0);
}

function getDefaultModelSlugs(models: IphoneModel[]) {
  const popular = models.filter((model) => model.isPopular).map((model) => model.slug);
  return popular.length ? popular : models.slice(0, 4).map((model) => model.slug);
}

function getUploadCount(form: FormData, names: string[]) {
  return names.reduce((total, name) => total + getUploadFiles(form, name).length, 0);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function AdminPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogResponse | null>(null);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("covers-cases");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>("");
  const [selectedModelSlugs, setSelectedModelSlugs] = useState<string[]>([]);
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [imageUploadNames, setImageUploadNames] = useState<string[]>([]);
  const [mediaUploadNames, setMediaUploadNames] = useState<string[]>([]);

  // Search and Category filter for products list
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields for editing
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editMrp, setEditMrp] = useState(0);
  const [editTag, setEditTag] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editSeoTitle, setEditSeoTitle] = useState("");
  const [editSeoDescription, setEditSeoDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editCollectionId, setEditCollectionId] = useState("");
  const [editFeaturesText, setEditFeaturesText] = useState("");
  const [editStock, setEditStock] = useState(0);
  const [editImageUploadNames, setEditImageUploadNames] = useState<string[]>([]);
  const [editMediaUploadNames, setEditMediaUploadNames] = useState<string[]>([]);
  const uploadBatchRef = useRef({ done: 0, total: 0 });

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

  const stats = useMemo(() => {
    const products = catalog?.products ?? [];
    const total = products.length;
    const active = products.filter((p) => p.isActive).length;
    const featured = products.filter((p) => p.isFeatured).length;
    const outOfStock = products.filter((p) => {
      if (p.requiresModelFit) {
        return p.modelOptions.filter((m) => m.isAvailable).length === 0;
      }
      return false;
    }).length;

    return { total, active, featured, outOfStock };
  }, [catalog]);

  const filteredProducts = useMemo(() => {
    const products = catalog?.products ?? [];
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.slug.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory =
        productCategoryFilter === "all" || p.categorySlug === productCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [catalog, productSearch, productCategoryFilter]);
  const uploadPercent = uploadProgress
    ? Math.max(8, Math.round((uploadProgress.done / uploadProgress.total) * 100))
    : 0;

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
    if (message) {
      toast.success(message, { id: "admin-message" });
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      toast.error(error, { id: "admin-error" });
    }
  }, [error]);

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

  function beginUploadBatch(total: number) {
    uploadBatchRef.current = { done: 0, total };

    if (total > 0) {
      setUploadProgress({ done: 0, total, fileName: "Preparing uploads" });
      toast.loading(`Uploading 0/${total}`, { id: "admin-upload" });
    }
  }

  function clearUploadBatch() {
    uploadBatchRef.current = { done: 0, total: 0 };
    setUploadProgress(null);
    toast.dismiss("admin-upload");
  }

  async function uploadFile(prefix: string, file: File) {
    const headers = await getHeaders();

    if (!headers) {
      throw new Error("Admin login is required for uploads.");
    }

    const batch = uploadBatchRef.current;
    const total = batch.total;
    const nextIndex = total ? batch.done + 1 : 1;
    const description = total ? `${nextIndex}/${total}: ${file.name}` : `Uploading ${file.name}`;

    if (total) {
      setUploadProgress({ done: batch.done, total, fileName: file.name });
      toast.loading(description, { id: "admin-upload" });
    }

    const form = new FormData();
    form.append("prefix", prefix);
    form.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers,
      body: form,
    });
    const result = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !result.url) {
      throw new Error(result.error ?? "Could not upload media.");
    }

    if (total) {
      const done = Math.min(uploadBatchRef.current.done + 1, total);
      uploadBatchRef.current = { done, total };
      setUploadProgress({ done, total, fileName: file.name });
      toast.loading(`Uploaded ${done}/${total}`, { id: "admin-upload" });
    }

    return result.url;
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

  async function uploadExtraMedia(form: FormData, mediaUrls: string[], categorySlug: string) {
    const mediaFiles = getUploadFiles(form, "mediaFiles");

    for (const mediaFile of mediaFiles) {
      mediaUrls.push(await uploadFile(`products/${categorySlug}/media`, mediaFile));
    }
  }

  async function uploadProductImages(
    form: FormData,
    mediaUrls: string[],
    categorySlug: string,
    currentPrimaryUrl: string,
  ) {
    const imageFiles = getUploadFiles(form, "imageFiles");
    let primaryUrl = currentPrimaryUrl;

    for (const imageFile of imageFiles) {
      const uploadedUrl = await uploadFile(`products/${categorySlug}/images`, imageFile);

      if (!primaryUrl) {
        primaryUrl = uploadedUrl;
      } else {
        mediaUrls.push(uploadedUrl);
      }
    }

    return primaryUrl;
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
      const mediaUrls = buildMediaUrls(form);

      beginUploadBatch(getUploadCount(form, ["imageFiles", "mediaFiles"]));
      imageUrl = await uploadProductImages(form, mediaUrls, selectedCategorySlug, imageUrl);
      await uploadExtraMedia(form, mediaUrls, selectedCategorySlug);

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
      setImageUploadNames([]);
      setMediaUploadNames([]);
      setMessage(`Product ${result.slug ?? ""} created with template defaults.`);
      await loadAdminData();
    } catch (createError) {
      setError(getErrorMessage(createError, "Could not create product."));
    } finally {
      clearUploadBatch();
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

      beginUploadBatch(bulkRows.length);

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
          imageUrl: await uploadFile(`products/${selectedCategorySlug}/images`, row.file),
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
      setError(getErrorMessage(bulkError, "Could not create bulk products."));
    } finally {
      clearUploadBatch();
      setIsBulkSubmitting(false);
    }
  }

  async function toggleProduct(product: Product) {
    setError("");
    setMessage("");
    const headers = await getHeaders();

    if (!headers) {
      return;
    }

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id, isActive: !product.isActive }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not update product status.");
      }

      setMessage(`${product.name} is now ${product.isActive ? "hidden" : "active"}.`);
      await loadAdminData();
    } catch (statusError) {
      setError(getErrorMessage(statusError, "Could not update product status."));
    }
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setEditName(product.name);
    setEditSlug(product.slug);
    setEditDescription(product.description || "");
    setEditPrice(product.price);
    setEditMrp(product.mrp);
    setEditTag(product.tag || "");
    setEditIsActive(product.isActive);
    setEditIsFeatured(product.isFeatured);
    setEditSeoTitle(product.seoTitle || "");
    setEditSeoDescription(product.seoDescription || "");
    setEditCategoryId(product.categoryId || "");
    setEditCollectionId(product.collectionId || "");
    setEditFeaturesText((product.features || []).join("\n"));
    const firstVariantStock = product.selectedModel?.stock ?? 25;
    setEditStock(firstVariantStock);
    setEditImageUploadNames([]);
    setEditMediaUploadNames([]);
    setIsEditModalOpen(true);
  }

  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;

    const formElement = e.currentTarget as HTMLFormElement;
    const form = new FormData(formElement);
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const headers = await getHeaders();
      if (!headers) return;
      const appendedMediaUrls = [
        ...String(form.get("editMediaUrls") ?? "")
          .split(/[\n,]+/)
          .map((url) => url.trim())
          .filter(Boolean),
        String(form.get("editInstagramReelUrl") ?? "").trim(),
      ].filter(Boolean);
      const editCategorySlug = editingProduct.categorySlug || "covers-cases";

      beginUploadBatch(getUploadCount(form, ["editImageFiles", "editMediaFiles"]));

      for (const imageFile of getUploadFiles(form, "editImageFiles")) {
        appendedMediaUrls.push(await uploadFile(`products/${editCategorySlug}/images`, imageFile));
      }

      for (const mediaFile of getUploadFiles(form, "editMediaFiles")) {
        appendedMediaUrls.push(await uploadFile(`products/${editCategorySlug}/media`, mediaFile));
      }

      const payload = {
        productId: editingProduct.id,
        name: editName,
        slug: editSlug,
        description: editDescription,
        price: Number(editPrice),
        mrp: Number(editMrp),
        tag: editTag,
        isActive: editIsActive,
        isFeatured: editIsFeatured,
        seoTitle: editSeoTitle,
        seoDescription: editSeoDescription,
        categoryId: editCategoryId || null,
        collectionId: editCollectionId || null,
        features: editFeaturesText
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        mediaUrls: appendedMediaUrls,
        stock: Number(editStock),
      };

      const res = await fetch("/api/admin/catalog", {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product.");
      }

      setMessage(`${editName} updated successfully.`);
      setIsEditModalOpen(false);
      setEditingProduct(null);
      setEditImageUploadNames([]);
      setEditMediaUploadNames([]);
      await loadAdminData();
    } catch (err) {
      setError(getErrorMessage(err, "Error updating product."));
    } finally {
      clearUploadBatch();
      setIsSubmitting(false);
    }
  }

  async function deleteProduct(product: Product) {
    setError("");
    setMessage("");

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

    try {
      const response = await fetch(
        `/api/admin/catalog?productId=${encodeURIComponent(product.id)}`,
        {
          method: "DELETE",
          headers,
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not delete product.");
      }

      setMessage(`${product.name} deleted.`);
      await loadAdminData();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "Could not delete product."));
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setError("");
    setMessage("");
    const headers = await getHeaders();

    if (!headers) {
      return;
    }

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Could not update order status.");
      }

      setMessage(`Order marked ${status}.`);
      await loadAdminData();
    } catch (orderError) {
      setError(getErrorMessage(orderError, "Could not update order status."));
    }
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

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Total Products
            </p>
            <p className="mt-2 text-2xl font-bold font-mono">{stats.total}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Active Catalog
            </p>
            <p className="mt-2 text-2xl font-bold font-mono text-emerald-500">{stats.active}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Out of Stock
            </p>
            <p className="mt-2 text-2xl font-bold font-mono text-rose-500">{stats.outOfStock}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Featured Items
            </p>
            <p className="mt-2 text-2xl font-bold font-mono text-amber-500">{stats.featured}</p>
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
        {uploadProgress && (
          <div className="mt-6 rounded-2xl border border-orange-200/70 bg-orange-50/80 p-4 text-sm shadow-[0_18px_50px_rgba(249,115,22,0.12)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-display text-sm font-semibold text-foreground">
                  Uploading to Cloudinary
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {uploadProgress.done}/{uploadProgress.total} uploaded /{" "}
                  <span className="break-all">{uploadProgress.fileName}</span>
                </p>
              </div>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-orange-600">
                {uploadPercent}%
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-orange-500 transition-all duration-300"
                style={{ width: `${uploadPercent}%` }}
              />
            </div>
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
                <div className="rounded-2xl border border-dashed border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Product images
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Upload multiple images. First image becomes the main product image; the rest
                        become gallery images.
                      </p>
                    </div>
                    <label
                      htmlFor="product-images"
                      className="cursor-pointer rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
                    >
                      Choose images
                    </label>
                  </div>
                  <input
                    id="product-images"
                    name="imageFiles"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setImageUploadNames(
                        Array.from(event.currentTarget.files ?? []).map((file) => file.name),
                      )
                    }
                  />
                  <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    {imageUploadNames.length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {imageUploadNames.length} image
                          {imageUploadNames.length === 1 ? "" : "s"} selected
                        </p>
                        {imageUploadNames.slice(0, 5).map((name, index) => (
                          <p key={`${name}-${index}`} className="truncate">
                            {index === 0 ? "Main: " : "Gallery: "}
                            {name}
                          </p>
                        ))}
                        {imageUploadNames.length > 5 && (
                          <p>+{imageUploadNames.length - 5} more images</p>
                        )}
                      </div>
                    ) : (
                      "No images selected"
                    )}
                  </div>
                  {uploadProgress && isSubmitting && imageUploadNames.length > 0 && (
                    <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
                      Uploading {uploadProgress.done}/{uploadProgress.total}:{" "}
                      <span className="break-all">{uploadProgress.fileName}</span>
                    </div>
                  )}
                </div>
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
                <div className="rounded-2xl border border-dashed border-border bg-background p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Videos / extra media
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Upload MP4/WebM videos or extra media for the product detail gallery.
                      </p>
                    </div>
                    <label
                      htmlFor="product-media"
                      className="cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-medium"
                    >
                      Choose media
                    </label>
                  </div>
                  <input
                    id="product-media"
                    name="mediaFiles"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(event) =>
                      setMediaUploadNames(
                        Array.from(event.currentTarget.files ?? []).map((file) => file.name),
                      )
                    }
                  />
                  <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    {mediaUploadNames.length > 0 ? (
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">
                          {mediaUploadNames.length} media file
                          {mediaUploadNames.length === 1 ? "" : "s"} selected
                        </p>
                        {mediaUploadNames.slice(0, 5).map((name, index) => (
                          <p key={`${name}-${index}`} className="truncate">
                            {name}
                          </p>
                        ))}
                        {mediaUploadNames.length > 5 && (
                          <p>+{mediaUploadNames.length - 5} more files</p>
                        )}
                      </div>
                    ) : (
                      "No media selected"
                    )}
                  </div>
                  {uploadProgress && isSubmitting && mediaUploadNames.length > 0 && (
                    <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
                      Uploading {uploadProgress.done}/{uploadProgress.total}:{" "}
                      <span className="break-all">{uploadProgress.fileName}</span>
                    </div>
                  )}
                </div>
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
                  {uploadProgress
                    ? `Uploading ${uploadProgress.done}/${uploadProgress.total}`
                    : isSubmitting
                      ? "Saving..."
                      : "Create product"}
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
                  {uploadProgress
                    ? `Uploading ${uploadProgress.done}/${uploadProgress.total}`
                    : isBulkSubmitting
                      ? "Creating..."
                      : `Create ${bulkRows.length || ""} products`}
                </button>
              </div>
            </form>
          </div>

          <div className="grid gap-6">
            <section className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">Products</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="h-9 w-44 rounded-full border border-border bg-background px-4 text-xs outline-none focus:border-foreground/40 transition"
                  />
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="h-9 rounded-full border border-border bg-background px-3 text-xs outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {filteredProducts.map((product) => (
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
                        onClick={() => openEditModal(product)}
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

      {/* Interactive Edit Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card/90 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Edit Product
                </span>
                <h3 className="text-xl font-bold">{editingProduct.name}</h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full border border-border p-2 hover:border-foreground/35 transition"
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-6 grid gap-6">
              {/* General details */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Name
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none focus:border-foreground/45"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Product Slug
                  <input
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none focus:border-foreground/45"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Category
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-foreground/45"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Collection
                  <select
                    value={editCollectionId}
                    onChange={(e) => setEditCollectionId(e.target.value)}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-foreground/45"
                  >
                    <option value="">Select Collection</option>
                    {(catalog?.collections ?? []).map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Pricing & Stock */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Price (INR)
                  <input
                    required
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none focus:border-foreground/45"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  MRP (INR)
                  <input
                    required
                    type="number"
                    value={editMrp}
                    onChange={(e) => setEditMrp(Number(e.target.value))}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none focus:border-foreground/45"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Badge / Tag
                  <input
                    value={editTag}
                    onChange={(e) => setEditTag(e.target.value)}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none focus:border-foreground/45"
                    placeholder="e.g. New, Hot"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Global Stock per Variant
                  <input
                    required
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(Number(e.target.value))}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none focus:border-foreground/45"
                  />
                </label>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="size-4 rounded border-border text-foreground focus:ring-0"
                    />
                    Is Active
                  </label>

                  <label className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editIsFeatured}
                      onChange={(e) => setEditIsFeatured(e.target.checked)}
                      className="size-4 rounded border-border text-foreground focus:ring-0"
                    />
                    Is Featured
                  </label>
                </div>
              </div>

              {/* Description */}
              <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Product Description
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-foreground/45 resize-none"
                />
              </label>

              {/* Bullet Features list */}
              <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Features list (one per line)
                <textarea
                  rows={3}
                  value={editFeaturesText}
                  onChange={(e) => setEditFeaturesText(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground outline-none focus:border-foreground/45 resize-none font-mono"
                  placeholder="e.g. 3m Drop Protection&#10;Tactile aluminum buttons&#10;MagSafe Snaps array"
                />
              </label>

              <div className="grid gap-4 border-t border-border pt-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Add gallery media
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    These files are appended to the existing product gallery. Existing images stay
                    untouched.
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Existing gallery
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Check what is already on this product before adding more media.
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {editingProduct.images.length} item
                      {editingProduct.images.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                    {editingProduct.images.map((image, index) => {
                      const mediaKind = image.kind ?? "image";

                      return (
                        <div key={`${image.id}-${image.url}`} className="min-w-0">
                          <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                            {mediaKind === "image" ? (
                              <Image
                                src={image.url}
                                alt={image.alt}
                                fill
                                sizes="96px"
                                className="object-contain"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                <span>{mediaKind}</span>
                                <span className="line-clamp-2 normal-case tracking-normal">
                                  Media
                                </span>
                              </div>
                            )}
                            <span className="absolute left-1.5 top-1.5 rounded-full bg-white/85 px-2 py-0.5 text-[9px] font-semibold shadow-sm backdrop-blur">
                              {image.isPrimary || index === 0 ? "Main" : index + 1}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-[10px] text-muted-foreground">
                            {image.alt || image.url}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-dashed border-border bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          More images
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Add extra product/gallery images.
                        </p>
                      </div>
                      <label
                        htmlFor="edit-product-images"
                        className="cursor-pointer rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background"
                      >
                        Choose images
                      </label>
                    </div>
                    <input
                      id="edit-product-images"
                      name="editImageFiles"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(event) =>
                        setEditImageUploadNames(
                          Array.from(event.currentTarget.files ?? []).map((file) => file.name),
                        )
                      }
                    />
                    <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      {editImageUploadNames.length > 0
                        ? `${editImageUploadNames.length} image${editImageUploadNames.length === 1 ? "" : "s"} selected`
                        : "No new images selected"}
                    </div>
                    {uploadProgress && isSubmitting && editImageUploadNames.length > 0 && (
                      <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
                        Uploading {uploadProgress.done}/{uploadProgress.total}:{" "}
                        <span className="break-all">{uploadProgress.fileName}</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-dashed border-border bg-background p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          More videos/media
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Add MP4/WebM videos or extra files.
                        </p>
                      </div>
                      <label
                        htmlFor="edit-product-media"
                        className="cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-medium"
                      >
                        Choose media
                      </label>
                    </div>
                    <input
                      id="edit-product-media"
                      name="editMediaFiles"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(event) =>
                        setEditMediaUploadNames(
                          Array.from(event.currentTarget.files ?? []).map((file) => file.name),
                        )
                      }
                    />
                    <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                      {editMediaUploadNames.length > 0
                        ? `${editMediaUploadNames.length} media file${editMediaUploadNames.length === 1 ? "" : "s"} selected`
                        : "No new media selected"}
                    </div>
                    {uploadProgress && isSubmitting && editMediaUploadNames.length > 0 && (
                      <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
                        Uploading {uploadProgress.done}/{uploadProgress.total}:{" "}
                        <span className="break-all">{uploadProgress.fileName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <textarea
                  name="editMediaUrls"
                  rows={2}
                  placeholder="Optional extra media URLs, one per line"
                  className="resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                />
                <input
                  name="editInstagramReelUrl"
                  placeholder="Optional Instagram Reel URL"
                  className="h-11 rounded-2xl border border-border bg-background px-4 text-sm outline-none"
                />
              </div>

              {/* SEO details */}
              <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SEO Title
                  <input
                    value={editSeoTitle}
                    onChange={(e) => setEditSeoTitle(e.target.value)}
                    className="h-11 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground outline-none focus:border-foreground/45"
                  />
                </label>

                <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SEO Description
                  <textarea
                    rows={2}
                    value={editSeoDescription}
                    onChange={(e) => setEditSeoDescription(e.target.value)}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground outline-none focus:border-foreground/45 resize-none"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 rounded-full border border-border px-6 text-sm font-semibold hover:border-foreground/35 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-full bg-foreground px-6 text-sm font-semibold text-background hover:opacity-90 transition disabled:opacity-50"
                >
                  {uploadProgress
                    ? `Uploading ${uploadProgress.done}/${uploadProgress.total}`
                    : isSubmitting
                      ? "Saving..."
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
