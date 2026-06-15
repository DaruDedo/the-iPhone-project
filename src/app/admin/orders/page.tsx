"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  PackageCheck,
  Search,
  ShieldCheck,
  Truck,
  User,
  Phone,
  MapPin,
  Mail,
  CreditCard,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { formatPrice } from "@/data/products";

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

const orderStatuses = ["new", "confirmed", "packed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const getHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const supabase = await getSupabaseBrowserClientAsync();
    if (!supabase) return {};

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return {};

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/admin/orders", { headers });
      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to load orders");
      }
      const data = (await res.json()) as { orders: AdminOrder[]; devMode?: boolean };
      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch orders");
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to update order status");
      }

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtering & Search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phone.includes(searchQuery);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Analytics for top counts
  const stats = useMemo(() => {
    const counts: Record<string, number> = {
      all: orders.length,
      new: 0,
      confirmed: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      case "confirmed":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
      case "packed":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300";
    }
  };

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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              Orders & Tracking.
            </h1>
          </div>
          <button
            onClick={() => void loadOrders()}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-foreground/45 transition"
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Status Count Filters */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          {["all", ...orderStatuses].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === status
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/20"
              }`}
            >
              {status} ({stats[status] ?? 0})
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="mt-6 relative">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
            <Search className="size-4" />
          </span>
          <input
            type="text"
            placeholder="Search by order number, customer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-border bg-card/65 pl-11 pr-4 text-sm outline-none focus:border-foreground/40 transition"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-2">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Orders List */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              <RefreshCw className="size-6 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-4">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              <PackageCheck className="size-10 mx-auto text-muted-foreground/60" />
              <p className="mt-4 font-medium">No orders found.</p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Try updating your filters or search query.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl border border-border bg-card transition-all overflow-hidden ${
                    isExpanded ? "ring-1 ring-foreground/20" : "hover:border-foreground/25"
                  }`}
                >
                  {/* Order Card Header */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {order.order_number}
                        </span>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
                            order.status,
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {order.customer_name} ·{" "}
                        <span className="font-mono text-muted-foreground">{order.phone}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Total
                        </p>
                        <p className="mt-1 font-mono font-bold text-lg text-foreground">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <ChevronDown
                        className={`size-5 text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Order Details Drawer */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 p-5 sm:p-8 space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer details */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <User className="size-4" />
                            Customer Information
                          </h3>
                          <div className="space-y-2.5 text-sm">
                            <p className="flex items-center gap-2">
                              <Phone className="size-4 text-muted-foreground" />
                              <span className="font-mono">{order.phone}</span>
                            </p>
                            <p className="flex items-center gap-2">
                              <Mail className="size-4 text-muted-foreground" />
                              <span>{order.email}</span>
                            </p>
                            <p className="flex items-start gap-2">
                              <MapPin className="size-4 text-muted-foreground mt-0.5" />
                              <span className="leading-relaxed">
                                {order.address} <br />
                                <strong className="font-mono text-xs">PIN: {order.pincode}</strong>
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Payment / Fulfill Status */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <CreditCard className="size-4" />
                            Fulfillment & Payment
                          </h3>
                          <div className="space-y-3.5">
                            <p className="text-sm">
                              Payment Mode:{" "}
                              <strong className="font-semibold text-foreground">
                                {order.payment_method}
                              </strong>
                            </p>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                Update Status
                              </label>
                              <div className="relative w-full max-w-xs">
                                <select
                                  disabled={updatingId === order.id}
                                  value={order.status}
                                  onChange={(e) =>
                                    void handleStatusChange(order.id, e.target.value)
                                  }
                                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-foreground/30 appearance-none font-semibold uppercase tracking-wider"
                                >
                                  {orderStatuses.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
                                  <ChevronDown className="size-4" />
                                </span>
                              </div>
                            </div>
                            {order.payment_method === "UPI" && (
                              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-xl flex items-start gap-1.5 leading-relaxed dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400">
                                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                <span>
                                  UPI order. Verify transaction receipt on WhatsApp before shipping.
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Items Table */}
                      <div className="space-y-3 border-t border-border pt-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                          Order Items ({order.order_items.length})
                        </h3>
                        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider font-bold">
                              <tr>
                                <th className="p-4 text-left">Item Name</th>
                                <th className="p-4 text-left">Model</th>
                                <th className="p-4 text-center">Qty</th>
                                <th className="p-4 text-right">Price</th>
                                <th className="p-4 text-right font-mono">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.order_items.map((item) => (
                                <tr key={item.id} className="border-t border-border">
                                  <td className="p-4 font-bold">{item.product_name}</td>
                                  <td className="p-4 text-muted-foreground">{item.model_name}</td>
                                  <td className="p-4 text-center">{item.quantity}</td>
                                  <td className="p-4 text-right font-mono">
                                    {formatPrice(item.line_total / item.quantity)}
                                  </td>
                                  <td className="p-4 text-right font-mono font-bold">
                                    {formatPrice(item.line_total)}
                                  </td>
                                </tr>
                              ))}
                              <tr className="border-t border-border bg-muted/10 font-medium">
                                <td colSpan={4} className="p-4 text-right text-muted-foreground">
                                  Subtotal
                                </td>
                                <td className="p-4 text-right font-mono">
                                  {formatPrice(order.subtotal)}
                                </td>
                              </tr>
                              <tr className="border-t border-border bg-muted/10 font-medium">
                                <td colSpan={4} className="p-4 text-right text-muted-foreground">
                                  Shipping
                                </td>
                                <td className="p-4 text-right font-mono">
                                  {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
                                </td>
                              </tr>
                              <tr className="border-t border-border bg-muted/20 font-bold text-base">
                                <td colSpan={4} className="p-4 text-right">
                                  Total
                                </td>
                                <td className="p-4 text-right font-mono text-foreground">
                                  {formatPrice(order.total)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
