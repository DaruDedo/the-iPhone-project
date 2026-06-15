"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MessageSquareText,
  Search,
  Star,
  Trash2,
  Check,
  X,
  RefreshCw,
  AlertCircle,
  PlusCircle,
  User,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";

type AdminReview = {
  id: string;
  productId: string;
  productName: string;
  name: string;
  city?: string;
  rating: number;
  quote: string;
  isApproved: boolean;
  createdAt: string;
};

type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', 'approved'

  // Add Review Form State
  const [isAdding, setIsAdding] = useState(false);
  const [formProductId, setFormProductId] = useState("");
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formQuote, setFormQuote] = useState("");
  const [submittingForm, setSubmittingForm] = useState(false);

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

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const headers = await getHeaders();

      // Load reviews
      const reviewsRes = await fetch("/api/admin/reviews", { headers });
      if (!reviewsRes.ok) {
        throw new Error("Failed to load reviews");
      }
      const reviewsData = (await reviewsRes.json()) as { reviews: AdminReview[] };
      setReviews(reviewsData.reviews || []);

      // Load products for form dropdown
      const catalogRes = await fetch("/api/admin/catalog", { headers });
      if (catalogRes.ok) {
        const catalogData = (await catalogRes.json()) as { products: CatalogProduct[] };
        setProducts(catalogData.products || []);
        if (catalogData.products?.length > 0) {
          setFormProductId(catalogData.products[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch data");
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleApproveToggle = async (reviewId: string, currentApprovedStatus: boolean) => {
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, isApproved: !currentApprovedStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update review status");
      }

      setReviews((prev) =>
        prev.map((rev) =>
          rev.id === reviewId ? { ...rev, isApproved: !currentApprovedStatus } : rev,
        ),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating review status");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const headers = await getHeaders();
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
        headers,
      });

      if (!res.ok) {
        throw new Error("Failed to delete review");
      }

      setReviews((prev) => prev.filter((rev) => rev.id !== reviewId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error deleting review");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProductId || !formName || !formQuote) {
      alert("Please fill out all fields");
      return;
    }

    setSubmittingForm(true);
    try {
      const headers = await getHeaders();
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: formProductId,
          name: formName,
          city: "",
          rating: formRating,
          quote: formQuote,
          isApproved: true, // Auto approve when created by admin
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: string };
        throw new Error(errData.error || "Failed to create review");
      }

      // Reload data
      setFormName("");
      setFormQuote("");
      setFormRating(5);
      setIsAdding(false);
      void loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error submitting review");
    } finally {
      setSubmittingForm(false);
    }
  };

  // Filters & Search
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const matchesSearch =
        rev.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.quote.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "approved" && rev.isApproved) ||
        (statusFilter === "pending" && !rev.isApproved);

      return matchesSearch && matchesStatus;
    });
  }, [reviews, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const counts = { all: reviews.length, approved: 0, pending: 0 };
    reviews.forEach((r) => {
      if (r.isApproved) counts.approved++;
      else counts.pending++;
    });
    return counts;
  }, [reviews]);

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
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Reviews.</h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90 transition"
            >
              <PlusCircle className="size-4" />
              {isAdding ? "Cancel" : "Add Review"}
            </button>
            <button
              onClick={() => void loadData()}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-foreground/45 transition"
              disabled={loading}
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Add Review Panel */}
        {isAdding && (
          <form
            onSubmit={(e) => void handleSubmitReview(e)}
            className="mt-8 rounded-3xl border border-border bg-card p-6 max-w-2xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <h2 className="text-lg font-bold">Add customer review</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Product
                </span>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Rating (1-5 Stars)
                </span>
                <select
                  value={formRating}
                  onChange={(e) => setFormRating(Number(e.target.value))}
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none font-bold"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)} ({n} Stars)
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Reviewer Name
                </span>
                <input
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground/45"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Review Description
              </span>
              <textarea
                required
                rows={3}
                placeholder="Review text..."
                value={formQuote}
                onChange={(e) => setFormQuote(e.target.value)}
                className="mt-2 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-foreground/45"
              />
            </label>

            <button
              type="submit"
              disabled={submittingForm}
              className="h-10 rounded-full bg-foreground px-5 text-sm font-semibold text-background hover:opacity-90 transition disabled:opacity-50"
            >
              {submittingForm ? "Saving review..." : "Save Review"}
            </button>
          </form>
        )}

        {/* Filters & Search */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          {[
            { key: "all", label: `All Reviews (${stats.all})` },
            { key: "approved", label: `Approved (${stats.approved})` },
            { key: "pending", label: `Pending (${stats.pending})` },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setStatusFilter(item.key)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === item.key
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card text-muted-foreground border-border hover:border-foreground/20"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 relative">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
            <Search className="size-4" />
          </span>
          <input
            type="text"
            placeholder="Search reviews by product name, reviewer name, or content..."
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

        {/* Reviews List */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              <RefreshCw className="size-6 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-4">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              <MessageSquareText className="size-10 mx-auto text-muted-foreground/60" />
              <p className="mt-4 font-medium">No reviews found.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between hover:border-foreground/20 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-amber-500 text-sm flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 fill-current ${
                            i < review.rating ? "text-amber-500" : "text-border"
                          }`}
                        />
                      ))}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        review.isApproved
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                          : "bg-amber-50 border-amber-100 text-amber-700"
                      }`}
                    >
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-foreground/80 leading-relaxed font-sans italic">
                    &quot;{review.quote}&quot;
                  </p>

                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1">
                      <User className="size-3" />
                      {review.name}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-foreground truncate">
                      {review.productName}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                  <button
                    onClick={() => void handleApproveToggle(review.id, review.isApproved)}
                    className={`size-9 rounded-full flex items-center justify-center border transition ${
                      review.isApproved
                        ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100"
                        : "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                    title={review.isApproved ? "Revoke Approval" : "Approve Review"}
                  >
                    {review.isApproved ? <X className="size-4" /> : <Check className="size-4" />}
                  </button>
                  <button
                    onClick={() => void handleDelete(review.id)}
                    className="size-9 rounded-full flex items-center justify-center border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                    title="Delete Review"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
