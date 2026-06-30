"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShoppingBasket,
  Search,
  MessageSquare,
  Mail,
  ExternalLink,
  ChevronDown,
  User,
} from "lucide-react";

import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { useTimeframe } from "@/context/admin-timeframe-context";

type CartLead = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  score: number;
  status: string;
  activeText: string;
  signalsCount: number;
  site: string;
  domain: string;
  value: number;
  summary: string;
  hasReward: boolean;
  productTag: string;
  connectionText: string;
  connectionDetail?: string;
  createdAt: string;
};

type Stats = {
  potentialCartLeads: number;
  connectedLeads: number;
  couponConnected: number;
  cartSignalValue: number;
  startedCheckoutCount: number;
};

export default function AdminLeadsPage() {
  const router = useRouter();
  const { timeframe } = useTimeframe();
  const [leads, setLeads] = useState<CartLead[]>([]);
  const [stats, setStats] = useState<Stats>({
    potentialCartLeads: 0,
    connectedLeads: 0,
    couponConnected: 0,
    cartSignalValue: 0,
    startedCheckoutCount: 0,
  });
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all"); // 'all', 'contact', 'checkout'
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

      const response = await fetch(`/api/admin/leads?timeframe=${timeframe}`, { headers });
      const result = (await response.json()) as {
        leads?: CartLead[];
        stats?: Stats;
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Could not load leads.");
        return;
      }

      setLeads(result.leads ?? []);
      if (result.stats) {
        setStats(result.stats);
      }
    }

    void loadLeads();
  }, [getHeaders, timeframe]);

  // Filter leads based on search and filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Search Query filter
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query
        ? lead.name.toLowerCase().includes(query) ||
          lead.phone.includes(query) ||
          (lead.email ?? "").toLowerCase().includes(query) ||
          lead.productTag.toLowerCase().includes(query)
        : true;

      // 2. Dropdown Session Filter
      let matchesFilter = true;
      if (sessionFilter === "contact") {
        matchesFilter = lead.phone !== "No contact yet";
      } else if (sessionFilter === "checkout") {
        matchesFilter = lead.status === "Checkout started";
      }

      return matchesSearch && matchesFilter;
    }, [searchQuery, sessionFilter]);
  }, [leads, searchQuery, sessionFilter]);

  const handleWhatsAppRecover = (lead: CartLead) => {
    const message = `Hi ${lead.name.split(" ")[0]}, I saw you were looking at the ${lead.productTag} cover on The.iPhone.Project but didn't finish your order. I can offer you a special discount to complete it now! Would you like me to send you the checkout link?`;
    window.open(`https://wa.me/91${lead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleEmailRecover = (lead: CartLead) => {
    if (!lead.email) return;
    const subject = "Complete your cover order - The.iPhone.Project";
    const body = `Hi ${lead.name.split(" ")[0]},\n\nWe saw that you left the ${lead.productTag} cover in your cart. You can complete your purchase here to secure your order.\n\nBest regards,\nThe.iPhone.Project Team`;
    window.open(`mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl">
        {/* Title row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-800/40 text-white">
              <ShoppingBasket className="size-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
              <h1 className="mt-1 text-3xl font-bold font-display text-white">Cart Leads</h1>
            </div>
          </div>
          <div className="hidden md:flex gap-2">
            <Link
              href="/admin"
              className="rounded-full border border-zinc-800 px-4 py-2 text-sm hover:border-foreground/40 text-zinc-400 hover:text-white"
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

        {/* Top Summary Cards */}
        <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800/40 bg-[#0e0e11] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Potential Cart Leads
            </p>
            <p className="mt-2 text-3xl font-black text-white font-mono leading-none">
              {stats.potentialCartLeads}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800/40 bg-[#0e0e11] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Connected Leads
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-400 font-mono leading-none">
              {stats.connectedLeads}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800/40 bg-[#0e0e11] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Coupon Connected
            </p>
            <p className="mt-2 text-3xl font-black text-white font-mono leading-none">
              {stats.couponConnected}
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800/40 bg-[#0e0e11] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Cart Signal Value
            </p>
            <p className="mt-2 text-2xl font-black text-yellow-500 font-mono leading-none">
              ₹{stats.cartSignalValue.toLocaleString("en-IN")} INR
            </p>
            <p className="mt-1.5 text-[10px] text-zinc-500 font-medium">
              {stats.startedCheckoutCount} started checkout
            </p>
          </div>
        </div>

        {/* Search & Filter row */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 max-w-lg items-center gap-3 rounded-full border border-zinc-800 bg-[#0c0c0e] px-4 py-2 text-sm">
            <Search className="size-4 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Search name, phone, email, coupon, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-zinc-200 placeholder-zinc-500 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto text-xs">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-[#0c0c0e] px-4 py-2 font-medium text-zinc-300 hover:border-zinc-700"
              >
                <span>
                  {sessionFilter === "all"
                    ? "All cart sessions"
                    : sessionFilter === "contact"
                    ? "With phone/email contact"
                    : "Checkout started"}
                </span>
                <ChevronDown className="size-3.5 text-zinc-500" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 z-20 w-52 rounded-2xl border border-zinc-800 bg-[#0e0e11] p-1.5 shadow-xl">
                  {[
                    { value: "all", label: "All cart sessions" },
                    { value: "contact", label: "With contact details" },
                    { value: "checkout", label: "Checkout started" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSessionFilter(opt.value);
                        setDropdownOpen(false);
                      }}
                      className={`w-full rounded-xl px-3.5 py-2 text-left text-xs transition ${
                        sessionFilter === opt.value
                          ? "bg-zinc-800 text-white font-semibold"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="text-zinc-500 font-medium font-mono shrink-0">
              {filteredLeads.length} leads
            </span>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-6 overflow-x-auto rounded-3xl border border-zinc-850 bg-[#0c0c0e]">
          <table className="w-full border-collapse text-left text-sm text-zinc-300">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Lead</th>
                <th className="px-6 py-4">Cart Signal</th>
                <th className="px-6 py-4">Connections</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500">
                    No matching cart leads found.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const hasContact = lead.phone !== "No contact yet";

                  return (
                    <tr key={lead.id} className="hover:bg-zinc-950/30 transition duration-150">
                      {/* Score Column */}
                      <td className="px-6 py-6 vertical-top align-top">
                        <div className="space-y-1">
                          <p className="text-2xl font-black text-yellow-500 font-mono leading-none">
                            {lead.score}
                          </p>
                          <p className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase">
                            Potential
                          </p>
                          <span className={`inline-block mt-2 rounded-full border px-2 py-0.5 text-[9px] font-medium ${
                            lead.status === "Checkout started"
                              ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
                              : "text-zinc-400 bg-zinc-800/40 border-zinc-700/30"
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                      </td>

                      {/* Lead Details Column */}
                      <td className="px-6 py-6 vertical-top align-top min-w-[220px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <User className="size-3.5 text-zinc-500 shrink-0" />
                            <p className="text-sm font-bold text-white">{lead.name}</p>
                          </div>
                          <p className="text-xs font-semibold text-zinc-400 font-mono">
                            {lead.phone}
                          </p>
                          <div className="flex flex-col gap-1 text-[11px] text-zinc-500 font-medium">
                            <p>{lead.activeText}</p>
                            <p>{lead.signalsCount} active signals</p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="rounded-full bg-zinc-800/60 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-zinc-400 border border-zinc-700/25">
                              {lead.site}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium">
                              {lead.domain}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cart Signal Column */}
                      <td className="px-6 py-6 vertical-top align-top min-w-[240px]">
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-white font-mono">
                            ₹{lead.value.toLocaleString("en-IN")} INR
                          </p>
                          <p className="text-xs text-zinc-400 font-medium">
                            {lead.summary}
                          </p>
                          <p className="text-[11px] text-yellow-500 font-medium">
                            No welcome-back reward captured
                          </p>
                          <div className="inline-block mt-2 rounded border border-zinc-800 bg-zinc-900/40 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                            {lead.productTag}
                          </div>
                        </div>
                      </td>

                      {/* Connections Column */}
                      <td className="px-6 py-6 vertical-top align-top">
                        <div className="space-y-2">
                          {lead.connectionText.startsWith("Checkout") ? (
                            <button className="flex items-center gap-2 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1.5 text-xs font-semibold text-yellow-400 border border-yellow-500/20">
                              <ShoppingBasket className="size-3.5" />
                              <span>{lead.connectionText}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/35 border border-zinc-700/20 px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                              {lead.connectionText}
                            </span>
                          )}
                          {lead.connectionDetail && (
                            <p className="text-[10px] text-zinc-500 font-medium italic pl-1">
                              {lead.connectionDetail}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="px-6 py-6 vertical-top align-top text-right shrink-0">
                        <div className="flex flex-col items-end gap-1.5">
                          <Link
                            href="/admin/products#catalog-section"
                            className="flex items-center justify-center gap-1.5 w-28 rounded-xl border border-zinc-800 px-3 py-2 text-xs font-bold text-zinc-400 hover:border-zinc-700 hover:text-white transition"
                          >
                            <span>Details</span>
                            <ExternalLink className="size-3" />
                          </Link>

                          <button
                            onClick={() => handleWhatsAppRecover(lead)}
                            disabled={!hasContact}
                            className={`flex items-center justify-center gap-1.5 w-28 rounded-xl px-3 py-2 text-xs font-bold transition ${
                              hasContact
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-zinc-900 text-zinc-600 border border-zinc-800/40 cursor-not-allowed"
                            }`}
                          >
                            <span>WhatsApp</span>
                            <ExternalLink className="size-3" />
                          </button>

                          <button
                            onClick={() => handleEmailRecover(lead)}
                            disabled={!lead.email}
                            className={`flex items-center justify-center gap-1.5 w-28 rounded-xl px-3 py-2 text-xs font-bold transition ${
                              lead.email
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                                : "bg-zinc-900 text-zinc-600 border border-zinc-800/40 cursor-not-allowed"
                            }`}
                          >
                            <span>{lead.email ? "Email" : "No Email"}</span>
                            <ExternalLink className="size-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
