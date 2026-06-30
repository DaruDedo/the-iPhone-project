"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { useTimeframe } from "@/context/admin-timeframe-context";

type Event = {
  id: string;
  eventName: string;
  source: string;
  createdAt: string;
  payload: {
    productSlug?: string;
    productName?: string;
    model?: string;
    quantity?: number;
  };
};

export default function AdminCartActivityPage() {
  const router = useRouter();
  const { timeframe } = useTimeframe();
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState("");

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
    async function loadCartActivity() {
      const headers = await getHeaders();

      if (!headers) {
        return;
      }

      const response = await fetch(`/api/admin/cart-activity?timeframe=${timeframe}`, { headers });
      const result = (await response.json()) as {
        events?: Event[];
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Could not load cart activity.");
        return;
      }

      setEvents(result.events ?? []);
    }

    void loadCartActivity();
  }, [getHeaders, timeframe]);

  return (
    <main className="min-h-screen bg-background px-3 py-10 text-foreground sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-4xl font-bold md:text-6xl">Cart Activity.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground hidden md:block">
              Live updates of shopper cart additions, item quantities, and selected phone models.
            </p>
          </div>
          <div className="flex gap-2 hidden md:flex">
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

        <div className="mt-8 grid gap-4">
          <section className="rounded-3xl border border-border bg-card p-4 sm:p-6">
            <h2 className="text-2xl font-bold">Cart Additions</h2>
            <div className="mt-5 grid gap-3">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cart additions logged yet.</p>
              ) : (
                events.map((event) => (
                  <article key={event.id} className="rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap justify-between gap-3 items-center">
                      <div>
                        <p className="text-sm font-bold">
                          {event.payload.productName || event.payload.productSlug || "Unknown Product"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Model: {event.payload.model || "Universal"} / Qty: {event.payload.quantity ?? 1}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {event.source}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(event.createdAt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
