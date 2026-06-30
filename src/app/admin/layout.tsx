"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Package,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  ShoppingBag,
  Truck,
  Bell,
  ShoppingCart,
  ShoppingBasket,
  Ticket,
  Users,
  LogIn,
  Settings,
  Download,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { TimeframeProvider, useTimeframe, timeframeOptions, Timeframe } from "@/context/admin-timeframe-context";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navigationGroups: NavGroup[] = [
  {
    label: "WORKSPACE",
    items: [
      { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { title: "AI Visibility", href: "/admin/ai-visibility", icon: Sparkles },
      { title: "Catalog", href: "/admin/products", icon: Package },
      { title: "Content", href: "/admin/content", icon: FileText },
      { title: "Images", href: "/admin/images", icon: ImageIcon },
      { title: "Reviews", href: "/admin/reviews", icon: MessageSquare },
      { title: "Templates", href: "/admin/templates", icon: FileText },
    ],
  },
  {
    label: "SALES",
    items: [
      { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { title: "Tracking", href: "/admin/tracking", icon: Truck },
      { title: "Stock Requests", href: "/admin/stock-requests", icon: Bell },
      { title: "Checkouts", href: "/admin/checkouts", icon: ShoppingCart },
      { title: "Cart Leads", href: "/admin/leads", icon: ShoppingBasket },
      { title: "Coupon Leads", href: "/admin/coupon-leads", icon: Ticket },
    ],
  },
  {
    label: "PEOPLE & SYSTEM",
    items: [
      { title: "Customers", href: "/admin/customers", icon: Users },
      { title: "Login Activity", href: "/admin/login-activity", icon: LogIn },
      { title: "Settings", href: "/admin/settings", icon: Settings },
      { title: "Data Export", href: "/admin/export", icon: Download },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <TimeframeProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </TimeframeProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { timeframe, setTimeframe } = useTimeframe();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <div className="dark bg-[#0a0a0c] min-h-screen text-foreground">{children}</div>;
  }

  async function handleLogout() {
    const supabase = await getSupabaseBrowserClientAsync();
    await supabase?.auth.signOut();
    router.push("/admin/login");
  }

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col justify-between bg-[#0e0e11] px-4 py-6 text-zinc-300">
        <div className="space-y-7">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-white font-mono text-xl font-black text-[#0c0c0e]">
              T
            </div>
            <div>
              <p className="font-display text-[13px] font-bold tracking-tight text-white leading-none">
                The<span className="text-[#ff5500]">.</span>iPhone<span className="text-[#ff5500]">.</span>Project
              </p>
              <p className="mt-1 text-[10px] text-zinc-500 leading-none">
                Operations desk
              </p>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-6">
            {navigationGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  {group.label}
                </p>
                <nav className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 text-[13px] font-medium transition duration-200 rounded-xl ${
                          isActive
                            ? "bg-white text-black font-semibold shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
                            : "hover:bg-zinc-800/38 hover:text-white"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="size-4" />
          <span>Log out</span>
        </button>
      </div>
    );
  }

  // Get current page title
  const activeItem = navigationGroups
    .flatMap((g) => g.items)
    .find((item) => item.href === pathname);
  const pageTitle = activeItem?.title ?? "Admin Panel";

  return (
    <div className="dark min-h-screen bg-[#0a0a0c] text-zinc-200 antialiased">
      {/* Permanent Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-zinc-800/40 md:block">
        <SidebarContent />
      </aside>

      {/* Mobile Header Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-850/45 bg-[#0e0e11]/90 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg border border-zinc-800 p-1.5 hover:bg-zinc-800/30 text-white"
            aria-label="Toggle menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-mono text-sm font-bold text-white tracking-tight">
            {pageTitle}
          </span>
        </div>
        
        {/* Timeframe Dropdown (Mobile) & Logo */}
        <div className="flex items-center gap-2">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as Timeframe)}
            className="rounded-lg border border-zinc-800 bg-transparent px-2 py-1 text-[11px] font-medium outline-none cursor-pointer text-zinc-300"
          >
            {timeframeOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0e0e11] text-zinc-300">
                {opt.value === "24h" ? "24h" : opt.label.replace("Last ", "")}
              </option>
            ))}
          </select>
          <div className="flex size-7 items-center justify-center rounded-lg bg-white font-mono text-sm font-black text-black">
            T
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex w-64 flex-col h-full animate-[slideIn_0.2s_ease-out]">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3.5 top-3.5 z-50 rounded-lg border border-zinc-800 p-1.5 hover:bg-zinc-800/30 text-zinc-400"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-col md:pl-64">
        {/* Top Header Row (Desktop) */}
        <header className="hidden h-14 items-center justify-between border-b border-zinc-800/40 bg-[#0c0c0e] px-8 md:flex">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              The.iPhone.Project
            </p>
            <p className="mt-0.5 text-xs text-zinc-400 font-medium">{pageTitle}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Timeframe selector (Desktop) */}
            <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 px-3 py-1 text-[11px] text-zinc-400">
              <span className="text-zinc-500 uppercase font-bold tracking-wider text-[9px]">Window</span>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                className="bg-transparent font-medium outline-none cursor-pointer text-zinc-300"
              >
                {timeframeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0e0e11] text-zinc-300">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <span className="rounded-full border border-zinc-800 px-3.5 py-1 text-[11px] font-medium text-zinc-400">
              🇮🇳 India
            </span>
            
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </div>

      {/* Animation helpers */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
