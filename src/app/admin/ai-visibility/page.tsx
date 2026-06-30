"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  ExternalLink,
} from "lucide-react";

import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { useTimeframe } from "@/context/admin-timeframe-context";

type AuditProduct = {
  id: string;
  name: string;
  slug: string;
  score: number;
  details: {
    hasDesc: boolean;
    hasSeoTitle: boolean;
    hasSeoDesc: boolean;
    hasFeatures: boolean;
  };
};

type SearchEvent = {
  id: string;
  createdAt: string;
  payload: {
    query?: string;
    resultsCount?: number;
  };
};

export default function AdminAIVisibilityPage() {
  const router = useRouter();
  const { timeframe } = useTimeframe();
  const [sources, setSources] = useState<Record<string, number>>({});
  const [searches, setSearches] = useState<SearchEvent[]>([]);
  const [products, setProducts] = useState<AuditProduct[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function loadMetrics() {
      const headers = await getHeaders();

      if (!headers) {
        return;
      }

      try {
        const response = await fetch(`/api/admin/ai-visibility?timeframe=${timeframe}`, { headers });
        const result = (await response.json()) as {
          sources?: Record<string, number>;
          searches?: SearchEvent[];
          products?: AuditProduct[];
          error?: string;
        };

        if (!response.ok) {
          setError(result.error ?? "Failed to load metrics.");
          return;
        }

        setSources(result.sources ?? {});
        setSearches(result.searches ?? []);
        setProducts(result.products ?? []);
      } catch (err) {
        setError("Failed to fetch AI Visibility metrics.");
      } finally {
        setLoading(false);
      }
    }

    void loadMetrics();
  }, [getHeaders, timeframe]);

  const aiTrafficCount = sources["ai"] ?? 0;
  const googleTrafficCount = sources["google"] ?? 0;
  const instagramTrafficCount = sources["instagram"] ?? 0;
  const directTrafficCount = sources["direct"] ?? 0;
  const whatsappTrafficCount = sources["whatsapp"] ?? 0;
  const totalTraffic = Object.values(sources).reduce((a, b) => a + b, 0);

  const averageScore = products.length
    ? Math.round(products.reduce((acc, p) => acc + p.score, 0) / products.length)
    : 0;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-4xl font-bold md:text-6xl flex items-center gap-3">
              AI Visibility. <Sparkles className="size-6 text-yellow-500 animate-pulse hidden md:block" />
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground hidden md:block">
              Track how discoverable your catalog is to AI engines (ChatGPT, Perplexity) and shopper search intent.
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm text-foreground">
            {error}
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              AI Traffic
            </p>
            <p className="mt-2 text-3xl font-bold text-yellow-500">
              {aiTrafficCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Bot hits (ChatGPT/Perplexity)
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Search Queries
            </p>
            <p className="mt-2 text-3xl font-bold text-white">
              {searches.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Storefront lookups logged
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Google Referrals
            </p>
            <p className="mt-2 text-3xl font-bold text-[#4285F4]">
              {googleTrafficCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Organic search index traffic
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              SEO Catalog Score
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {averageScore}%
            </p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Average product audit rate
            </p>
          </div>
        </div>

        {/* Audit Details */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Catalog Audit Table */}
          <section className="lg:col-span-2 rounded-3xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Catalog AI Readiness Audit
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Evaluates if products are optimized with search descriptions, bullet specs, and custom SEO tags.
            </p>

            <div className="mt-5 space-y-3">
              {products.length === 0 ? (
                <p className="text-sm text-zinc-500">No products found in catalog.</p>
              ) : (
                products.map((p) => {
                  let statusColor = "text-red-400 bg-red-500/10 border-red-500/20";
                  let statusText = "Needs Work";
                  if (p.score >= 75) {
                    statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                    statusText = "AI Visible";
                  } else if (p.score >= 50) {
                    statusColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
                    statusText = "Optimized";
                  }

                  return (
                    <article key={p.id} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate text-white">{p.name}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {p.details.hasDesc ? (
                                <CheckCircle2 className="size-3 text-emerald-400" />
                              ) : (
                                <XCircle className="size-3 text-red-400" />
                              )}
                              Description
                            </span>
                            <span className="flex items-center gap-1">
                              {p.details.hasFeatures ? (
                                <CheckCircle2 className="size-3 text-emerald-400" />
                              ) : (
                                <XCircle className="size-3 text-red-400" />
                              )}
                              Features
                            </span>
                            <span className="flex items-center gap-1">
                              {p.details.hasSeoTitle ? (
                                <CheckCircle2 className="size-3 text-emerald-400" />
                              ) : (
                                <XCircle className="size-3 text-red-400" />
                              )}
                              SEO Title
                            </span>
                            <span className="flex items-center gap-1">
                              {p.details.hasSeoDesc ? (
                                <CheckCircle2 className="size-3 text-emerald-400" />
                              ) : (
                                <XCircle className="size-3 text-red-400" />
                              )}
                              SEO Desc
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusColor}`}>
                            {statusText}
                          </span>
                          <span className="text-sm font-bold text-white w-8 text-right">
                            {p.score}%
                          </span>
                          <Link
                            href={`/admin/products#catalog-section`}
                            className="rounded-lg border border-border p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* Traffic Breakdown & Searches */}
          <div className="space-y-6">
            {/* Traffic Sources */}
            <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Referral Channels
              </h2>
              <div className="mt-5 space-y-3.5">
                {[
                  { name: "Direct / Untracked", count: directTrafficCount, color: "bg-zinc-500" },
                  { name: "Organic Google", count: googleTrafficCount, color: "bg-[#4285F4]" },
                  { name: "AI Search Bots", count: aiTrafficCount, color: "bg-yellow-500" },
                  { name: "Instagram Referral", count: instagramTrafficCount, color: "bg-[#E1306C]" },
                  { name: "WhatsApp Share", count: whatsappTrafficCount, color: "bg-[#25D366]" },
                ].map((s) => {
                  const pct = totalTraffic ? Math.round((s.count / totalTraffic) * 100) : 0;
                  return (
                    <div key={s.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-zinc-300">{s.name}</span>
                        <span className="text-muted-foreground">{s.count} hits ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Shopper Keywords */}
            <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Shopper Searches
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Recent storefront search phrases and products queried.
              </p>

              <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {searches.length === 0 ? (
                  <p className="text-sm text-zinc-500">No storefront search activity yet.</p>
                ) : (
                  searches.map((s) => (
                    <div key={s.id} className="flex justify-between items-center text-xs p-2.5 rounded-xl border border-border bg-muted/20">
                      <span className="font-medium text-white">"{s.payload.query || "unknown"}"</span>
                      <span className="text-muted-foreground text-[10px]">
                        {s.payload.resultsCount ?? 0} results
                      </span>
                    </div>
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
