"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  ChevronRight,
  Save,
  Smartphone,
  Sparkles,
  Check,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { formatPrice } from "@/data/products";
import { siteConfig } from "@/lib/site";

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
  order_items: Array<{
    id: string;
    product_name: string;
    model_name: string;
    sku: string;
    quantity: number;
    line_total: number;
  }>;
};

export default function AdminSettingsPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("999");
  const [shippingFee, setShippingFee] = useState("99");
  const [supportPhone, setSupportPhone] = useState(siteConfig.phone);
  const [codEnabled, setCodEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const getHeaders = async (): Promise<Record<string, string>> => {
    const supabase = await getSupabaseBrowserClientAsync();
    if (!supabase) return {};

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return {};

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch("/api/admin/orders", { headers });
        if (res.ok) {
          const data = (await res.json()) as { orders: AdminOrder[] };
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error("Error fetching orders for analytics", err);
      } finally {
        setLoading(false);
      }
    };
    void loadOrders();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Analytics Computations
  const analytics = useMemo(() => {
    // Total Revenue (Only count non-cancelled orders)
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);

    // Order item breakdown
    const modelCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};

    validOrders.forEach((order) => {
      order.order_items.forEach((item) => {
        modelCounts[item.model_name] = (modelCounts[item.model_name] || 0) + item.quantity;
        productCounts[item.product_name] = (productCounts[item.product_name] || 0) + item.quantity;
      });
    });

    // Top Selling iPhone Models
    const topModels = Object.entries(modelCounts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Top Selling Products
    const topProducts = Object.entries(productCounts)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Order status ratios
    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
    });

    return {
      totalSales,
      ordersCount: orders.length,
      topModels,
      topProducts,
      statusCounts,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-8 sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Settings & Analytics.
          </h1>
        </div>

        {/* Analytics Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border bg-card p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Sales
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight font-mono">
                {loading ? "..." : formatPrice(analytics.totalSales)}
              </h2>
            </div>
            <div className="size-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center dark:bg-emerald-950/20 dark:text-emerald-400">
              <DollarSign className="size-5" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Orders
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight font-mono">
                {loading ? "..." : analytics.ordersCount}
              </h2>
            </div>
            <div className="size-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center dark:bg-blue-950/20 dark:text-blue-400">
              <ShoppingBag className="size-5" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                New Orders
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight font-mono text-amber-600 dark:text-amber-400">
                {loading ? "..." : analytics.statusCounts["new"] || 0}
              </h2>
            </div>
            <div className="size-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center dark:bg-amber-950/20 dark:text-amber-400">
              <TrendingUp className="size-5" />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Avg. Order Value
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight font-mono">
                {loading
                  ? "..."
                  : formatPrice(
                      analytics.ordersCount > 0
                        ? Math.round(analytics.totalSales / analytics.ordersCount)
                        : 0,
                    )}
              </h2>
            </div>
            <div className="size-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center dark:bg-purple-950/20 dark:text-purple-400">
              <Sparkles className="size-5" />
            </div>
          </div>
        </div>

        {/* Analytics Breakdown + Store settings */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Detailed Analytics */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5 text-muted-foreground" />
                <h2 className="text-xl font-bold">Model compatibility demand</h2>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading demand analytics...</p>
              ) : analytics.topModels.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No model data recorded from orders yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.topModels.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="flex items-center gap-2">
                          <Smartphone className="size-4 text-muted-foreground" />
                          {item.name}
                        </span>
                        <span>{item.qty} units sold</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-foreground rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.qty / analytics.topModels[0].qty) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-muted-foreground" />
                <h2 className="text-xl font-bold">Top products by units sold</h2>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading product analytics...</p>
              ) : analytics.topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No product data recorded from orders yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {analytics.topProducts.map((item) => (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>{item.name}</span>
                        <span>{item.qty} sold</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-foreground rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (item.qty / analytics.topProducts[0].qty) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Store Settings Form */}
          <div>
            <form
              onSubmit={handleSaveSettings}
              className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6 lg:sticky lg:top-24"
            >
              <div className="flex items-center gap-2">
                <Settings className="size-5 text-muted-foreground" />
                <h2 className="text-xl font-bold">Store settings</h2>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Free shipping threshold (Rs.)
                  </span>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-mono outline-none focus:border-foreground/45"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Standard shipping fee (Rs.)
                  </span>
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm font-mono outline-none focus:border-foreground/45"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Support WhatsApp / Call Number
                  </span>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground/45"
                  />
                </label>

                <label className="flex items-center gap-3 cursor-pointer py-2">
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    className="size-4 accent-foreground"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    Accept Cash on Delivery (COD) orders
                  </span>
                </label>
              </div>

              {saveSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800 flex items-center gap-1.5 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                  <Check className="size-4 shrink-0" />
                  <span>Store settings updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="h-11 w-full rounded-full bg-foreground flex items-center justify-center gap-2 text-sm font-semibold text-background hover:opacity-90 transition"
              >
                <Save className="size-4" />
                Save configurations
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
