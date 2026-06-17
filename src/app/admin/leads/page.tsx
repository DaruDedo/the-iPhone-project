"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";

type Lead = {
  id: string;
  type: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  status: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

type Event = {
  id: string;
  eventName: string;
  source: string;
  createdAt: string;
  payload: Record<string, unknown>;
};

export default function AdminLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
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
    async function loadLeads() {
      const headers = await getHeaders();

      if (!headers) {
        return;
      }

      const response = await fetch("/api/admin/leads", { headers });
      const result = (await response.json()) as {
        leads?: Lead[];
        events?: Event[];
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Could not load leads.");
        return;
      }

      setLeads(result.leads ?? []);
      setEvents(result.events ?? []);
    }

    void loadLeads();
  }, [getHeaders]);

  return (
    <main className="min-h-screen bg-background px-3 py-10 text-foreground sm:px-6">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
            <h1 className="mt-2 text-4xl font-bold md:text-6xl">Leads.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Cart leads, coupon attempts, checkout drafts, and behavior events.
            </p>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"
          >
            Dashboard
          </Link>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm text-foreground">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">Lead inbox</h2>
            <div className="mt-5 grid gap-3">
              {leads.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No leads yet. Run the sales-system migration to start saving them.
                </p>
              ) : (
                leads.map((lead) => (
                  <article key={lead.id} className="rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold">{lead.type}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {lead.name || "Unknown"} / {lead.phone || lead.email || "No contact"}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs">{lead.source}</span>
                    </div>
                    <pre className="mt-3 overflow-auto rounded-xl bg-muted/50 p-3 text-[11px] text-muted-foreground">
                      {JSON.stringify(lead.payload, null, 2)}
                    </pre>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold">Recent events</h2>
            <div className="mt-5 grid gap-3">
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No behavior events yet.</p>
              ) : (
                events.map((event) => (
                  <article key={event.id} className="rounded-2xl border border-border p-4">
                    <div className="flex flex-wrap justify-between gap-3">
                      <p className="text-sm font-bold">{event.eventName}</p>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs">
                        {event.source}
                      </span>
                    </div>
                    <pre className="mt-3 overflow-auto rounded-xl bg-muted/50 p-3 text-[11px] text-muted-foreground">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
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
