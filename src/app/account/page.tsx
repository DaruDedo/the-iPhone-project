"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Lock,
  ArrowLeft,
  Mail,
  Smartphone,
  MapPin,
  ClipboardList,
  Sparkles,
} from "lucide-react";

import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { formatPrice } from "@/data/products";

type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  isAdmin?: boolean;
};

type OrderItem = {
  id: string;
  productName: string;
  modelName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function AccountPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<{ email: string; token: string } | null>(null);

  // Authentication UI State
  const [emailInput, setEmailInput] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isNewUser, setIsNewUser] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    phone: "",
    address: "",
    pincode: "",
  });
  const [otpInput, setOtpInput] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Dashboard UI State
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Global State
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize Auth Mode & Session
  useEffect(() => {
    async function initAuth() {
      try {
        const localEmail = localStorage.getItem("user_session_email");
        const localToken = localStorage.getItem("user_session_token");

        if (localEmail && localToken) {
          setSessionUser({
            email: localEmail,
            token: localToken,
          });
          await loadUserData(localEmail, localToken);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  // Fetch Profile and Orders
  async function loadUserData(email: string, token: string) {
    setLoading(true);
    setError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch profile
      const profileRes = await fetch("/api/user/profile", { headers });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      } else if (profileRes.status === 404) {
        // Logged in but profile record doesn't exist (new user who hasn't submitted details yet)
        const checkData = await profileRes.json();
        setProfile({
          id: "",
          email,
          name: "",
          phone: "",
          address: "",
          pincode: "",
          isAdmin: checkData.isAdmin,
        });
        setActiveTab("profile"); // Guide to edit profile
      }

      // Fetch orders
      const ordersRes = await fetch("/api/user/orders", { headers });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
      setError("Failed to load account details.");
    } finally {
      setLoading(false);
    }
  }

  // Handle Email Submission
  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setError("");
    setActionLoading(true);

    try {
      const email = emailInput.trim().toLowerCase();

      // Check if user exists in database
      const checkRes = await fetch(`/api/user/check?email=${encodeURIComponent(email)}`);
      const checkData = await checkRes.json();

      setIsNewUser(checkData.isNew);

      // Trigger OTP send via backend API
      const otpRes = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!otpRes.ok) {
        const otpErr = await otpRes.json();
        setError(otpErr.details ? `${otpErr.error}: ${otpErr.details}` : (otpErr.error ?? "Failed to request verification code. Please try again."));
        setActionLoading(false);
        return;
      }

      const otpData = await otpRes.json();
      if (otpData.devMode && otpData.code) {
        // Dev Mode: Generate a mock OTP code and show in UI
        setDevOtp(otpData.code);
      }

      setStep("otp");
    } catch (err) {
      console.error("OTP request error:", err);
      setError("Failed to request login code. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  // Handle OTP Verification
  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otpInput.trim()) return;

    setError("");
    setActionLoading(true);

    const email = emailInput.trim().toLowerCase();

    try {
      let verifiedToken = "";

      // Submit code to custom OTP verify API
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otpInput.trim() }),
      });

      if (!verifyRes.ok) {
        const verifyErr = await verifyRes.json();
        setError(verifyErr.details ? `${verifyErr.error}: ${verifyErr.details}` : (verifyErr.error ?? "Invalid OTP code. Please check again."));
        setActionLoading(false);
        return;
      }

      const verifyData = await verifyRes.json();
      verifiedToken = verifyData.token;

      // Save custom JWT session in local storage
      localStorage.setItem("user_session_email", email);
      localStorage.setItem("user_session_token", verifiedToken);

      // If they are a new user, register their details now
      if (isNewUser) {
        const regRes = await fetch("/api/user/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${verifiedToken}`,
          },
          body: JSON.stringify({
            name: registerForm.name,
            phone: registerForm.phone,
            address: registerForm.address,
            pincode: registerForm.pincode,
          }),
        });

        if (!regRes.ok) {
          const regErr = await regRes.json();
          setError(regErr.error ?? "Failed to save shipping details.");
          setActionLoading(false);
          return;
        }
      }

      // Login success
      setSessionUser({ email, token: verifiedToken });
      await loadUserData(email, verifiedToken);
      setStep("email");
      setDevOtp(null);
    } catch (err) {
      console.error("OTP verification error:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  // Handle Profile Update
  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionUser || !profile) return;

    setError("");
    setSuccessMessage("");
    setActionLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionUser.token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          pincode: profile.pincode,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to update profile.");
        return;
      }

      const updated = await res.json();
      setProfile({
        ...updated,
        isAdmin: profile.isAdmin,
      });
      setSuccessMessage("Shipping details updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    setLoading(true);
    try {
      localStorage.removeItem("user_session_email");
      localStorage.removeItem("user_session_token");
      
      setSessionUser(null);
      setProfile(null);
      setOrders([]);
      setEmailInput("");
      setOtpInput("");
      setStep("email");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Toggle expanded order details
  function toggleOrder(orderId: string) {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-foreground">
        <div className="size-10 rounded-full border-2 border-[#ff5500] border-t-transparent animate-spin" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Loading Account Portal...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Page Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Store
        </Link>

        {/* 1. AUTHENTICATED USER DASHBOARD */}
        {sessionUser && profile ? (
          <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#ff5500]">
                  Welcome back
                </span>
                <h1 className="text-3xl font-display font-extrabold tracking-tight uppercase mt-1">
                  {profile.name || "My Account"}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
              </div>

              <div className="flex items-center gap-3">
                {profile.isAdmin && (
                  <Link
                    href="/admin"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/5 px-4 text-xs font-bold text-purple-600 hover:bg-purple-500/10 transition-all shadow-[0_0_12px_rgba(168,85,247,0.08)]"
                  >
                    <Sparkles size={13} className="text-purple-500" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#ff5500]/20 bg-white px-4 text-xs font-bold text-[#ff5500] hover:bg-[#ff5500]/5 transition-all cursor-pointer"
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border/30 gap-6 text-sm">
              <button
                onClick={() => setActiveTab("orders")}
                className={`pb-3 font-sans font-bold uppercase tracking-wider text-xs border-b-2 transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "border-[#ff5500] text-foreground"
                    : "border-transparent text-muted-foreground/60 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <ClipboardList size={13} /> Order History ({orders.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`pb-3 font-sans font-bold uppercase tracking-wider text-xs border-b-2 transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "border-[#ff5500] text-foreground"
                    : "border-transparent text-muted-foreground/60 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin size={13} /> Shipping Address
                </span>
              </button>
            </div>

            {/* TAB CONTENT: ORDERS */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="rounded-3xl border border-border/60 bg-card p-12 text-center">
                    <div className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground/75">
                      <ShoppingBag size={20} />
                    </div>
                    <h2 className="mt-4 text-lg font-bold font-display uppercase">
                      No orders found
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                      You haven't placed any orders yet. Visit our shop catalog to find premium
                      covers!
                    </p>
                    <Link
                      href="/#shop"
                      className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ff9d54_0%,#ff5500_100%)] border border-[#e04b00] px-6 text-xs font-display font-extrabold uppercase text-[#000000] hover:opacity-95 transition-all shadow-[0_4px_12px_rgba(255,85,0,0.25)]"
                    >
                      Shop Covers
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isExpanded = expandedOrders[order.id];
                      return (
                        <div
                          key={order.id}
                          className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
                        >
                          {/* Order Summary Header Row */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 bg-muted/20 border-b border-border/30">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                  Order Number
                                </p>
                                <p className="text-[13px] font-mono font-bold mt-1 text-foreground">
                                  {order.orderNumber}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                  Date Placed
                                </p>
                                <p className="text-[13px] font-bold mt-1 text-foreground">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                  Total Amount
                                </p>
                                <p className="text-[13px] font-bold mt-1 text-[#ff5500]">
                                  {formatPrice(order.total)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                  Status
                                </p>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase mt-1 ${
                                    order.status === "completed"
                                      ? "bg-emerald-50 border border-emerald-100/50 text-emerald-700"
                                      : order.status === "cancelled"
                                        ? "bg-destructive/10 text-destructive"
                                        : "bg-[#ff5500]/5 border border-[#ff5500]/15 text-[#ff5500]"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleOrder(order.id)}
                              className="self-end md:self-center inline-flex items-center gap-1 text-xs font-bold text-[#ff5500] hover:opacity-85 focus:outline-none cursor-pointer"
                            >
                              {isExpanded ? "Hide Details" : "View Items"}
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* Expanded Order Items and Delivery Info */}
                          {isExpanded && (
                            <div className="p-5 md:p-6 space-y-6 animate-[fadeIn_0.2s_ease-out_forwards]">
                              {/* Items List */}
                              <div>
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                  Items In Order
                                </h4>
                                <div className="divide-y divide-border/30">
                                  {order.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className="py-3 flex items-center justify-between gap-4 text-xs"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="font-display font-bold text-foreground text-[13px] uppercase">
                                          {item.productName}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                          Model: {item.modelName} • Qty: {item.quantity}
                                        </p>
                                      </div>
                                      <p className="font-bold text-foreground shrink-0 text-right">
                                        {formatPrice(item.lineTotal)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Delivery info breakdown */}
                              <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-border/30 text-xs">
                                <div>
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                    Shipping Details
                                  </h4>
                                  <p className="font-bold text-foreground">{order.customerName}</p>
                                  <p className="text-muted-foreground mt-1 leading-relaxed">
                                    {order.address}
                                  </p>
                                  <p className="text-muted-foreground mt-0.5">
                                    PIN: {order.pincode}
                                  </p>
                                  <p className="text-muted-foreground mt-0.5">
                                    Phone: {order.phone}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                    Payment Method
                                  </h4>
                                  <p className="font-bold text-foreground uppercase">
                                    {order.paymentMethod === "COD"
                                      ? "Cash on Delivery (COD)"
                                      : "UPI Payment"}
                                  </p>

                                  <div className="mt-4 flex justify-between items-center text-[13px] pt-4 border-t border-border/35">
                                    <span className="font-semibold text-muted-foreground">
                                      Total Paid:
                                    </span>
                                    <span className="font-bold text-[#ff5500] text-[15px]">
                                      {formatPrice(order.total)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PROFILE ADDRESS */}
            {activeTab === "profile" && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                <p className="text-[10px] uppercase font-bold tracking-[0.20em] text-muted-foreground mb-6">
                  Manage Shipping Address
                </p>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {error && (
                    <div className="rounded-2xl bg-destructive/10 p-3.5 text-xs text-foreground font-sans">
                      {error}
                    </div>
                  )}
                  {successMessage && (
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-100/50 p-3.5 text-xs text-emerald-800 font-sans">
                      {successMessage}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Full Name
                      </span>
                      <input
                        type="text"
                        required
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-xs outline-none focus:border-foreground/50 transition-colors"
                        placeholder="John Doe"
                      />
                    </label>

                    <label className="block">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Phone Number
                      </span>
                      <input
                        type="tel"
                        required
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-xs outline-none focus:border-foreground/50 transition-colors"
                        placeholder="9876543210"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Full Address
                    </span>
                    <textarea
                      required
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="mt-2 min-h-24 w-full rounded-2xl border border-border bg-background p-4 text-xs outline-none focus:border-foreground/50 transition-colors resize-none leading-relaxed"
                      placeholder="Street address, Apartment, City, State"
                    />
                  </label>

                  <label className="block sm:max-w-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Pincode
                    </span>
                    <input
                      type="text"
                      required
                      value={profile.pincode}
                      onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                      className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-xs outline-none focus:border-foreground/50 transition-colors"
                      placeholder="400001"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="h-11 rounded-full bg-[linear-gradient(180deg,#ff9d54_0%,#ff5500_100%)] border border-[#e04b00] px-6 text-xs font-display font-extrabold uppercase text-[#000000] hover:opacity-95 transition-all shadow-[0_4px_12px_rgba(255,85,0,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? "Saving details..." : "Save Address"}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* 2. AUTHENTICATION (LOGIN / REGISTER FLOW) SCREEN */
          <div className="mx-auto max-w-md mt-6 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-md">
            <div className="flex flex-col items-center text-center">
              <div className="grid size-12 place-items-center rounded-full bg-[#ff5500]/10 text-[#ff5500] mb-4">
                <UserIcon size={20} />
              </div>
              <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-muted-foreground">
                Customer Portal
              </p>
              <h1 className="mt-2 text-2xl font-display font-extrabold tracking-tight uppercase">
                {step === "email" ? "Login or Sign Up" : "Enter Verification Code"}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-relaxed">
                {step === "email"
                  ? "Access your shipping profile and order history using passwordless email OTP verification."
                  : `We sent a 6-digit OTP code to ${emailInput.toLowerCase()}. Enter it below to verify.`}
              </p>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="mt-6 rounded-2xl bg-destructive/10 p-3.5 text-xs text-foreground font-sans">
                {error}
              </div>
            )}

            {/* STEP 1: EMAIL ENTRY FORM */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </span>
                  <div className="relative mt-2 flex items-center">
                    <Mail size={14} className="absolute left-4 text-muted-foreground/50" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-xs outline-none focus:border-foreground/50 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="h-12 w-full rounded-full bg-foreground px-6 text-xs font-display font-extrabold uppercase text-background hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? "Sending code..." : "Continue"}
                </button>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION & OPTIONAL DETAILS FOR NEW USER */}
            {step === "otp" && (
              <form onSubmit={handleOtpVerify} className="mt-6 space-y-5">
                {/* Developer Mode OTP display helper */}
                {devOtp && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-1.5 dark:bg-amber-950/10 dark:border-amber-900/30">
                    <p className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 font-sans">
                      <Sparkles size={12} /> Local Dev Mode Active
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Supabase auth is bypassed locally. Use the mock verification code:{" "}
                      <code className="bg-background px-1.5 py-0.5 rounded border font-mono font-bold text-foreground text-xs">
                        {devOtp}
                      </code>
                    </p>
                  </div>
                )}

                {/* Additional registration fields for new users */}
                {isNewUser && (
                  <div className="space-y-4 border-b border-border/30 pb-4 animate-[fadeIn_0.2s_ease-out_forwards]">
                    <div className="p-3 bg-[#ff5500]/5 border border-[#ff5500]/10 rounded-2xl text-[11px] text-muted-foreground leading-normal font-sans">
                      🎁 <strong>New Account Registration:</strong> We couldn't find past orders for
                      this email. Enter your delivery details to register and verify.
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Full Name
                        </span>
                        <input
                          type="text"
                          required
                          value={registerForm.name}
                          onChange={(e) =>
                            setRegisterForm({ ...registerForm, name: e.target.value })
                          }
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-foreground/50 transition-colors"
                          placeholder="John Doe"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Phone Number
                        </span>
                        <input
                          type="tel"
                          required
                          value={registerForm.phone}
                          onChange={(e) =>
                            setRegisterForm({ ...registerForm, phone: e.target.value })
                          }
                          className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-foreground/50 transition-colors"
                          placeholder="9876543210"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Full Delivery Address
                      </span>
                      <textarea
                        required
                        value={registerForm.address}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, address: e.target.value })
                        }
                        className="mt-1.5 min-h-16 w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:border-foreground/50 transition-colors resize-none leading-relaxed"
                        placeholder="Street address, Apartment, City, State"
                      />
                    </label>

                    <label className="block sm:max-w-[150px]">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        Pincode
                      </span>
                      <input
                        type="text"
                        required
                        value={registerForm.pincode}
                        onChange={(e) =>
                          setRegisterForm({ ...registerForm, pincode: e.target.value })
                        }
                        className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none focus:border-foreground/50 transition-colors"
                        placeholder="400001"
                      />
                    </label>
                  </div>
                )}

                {/* OTP Code field */}
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Verification Code (OTP)
                  </span>
                  <div className="relative mt-2 flex items-center">
                    <Lock size={14} className="absolute left-4 text-muted-foreground/50" />
                    <input
                      type="text"
                      required
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                      className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-xs outline-none focus:border-foreground/50 transition-colors tracking-[0.5em] font-mono font-bold text-center"
                      placeholder="000000"
                    />
                  </div>
                </label>

                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="h-12 w-full rounded-full bg-[linear-gradient(180deg,#ff9d54_0%,#ff5500_100%)] border border-[#e04b00] px-6 text-xs font-display font-extrabold uppercase text-[#000000] hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_4px_12px_rgba(255,85,0,0.2)]"
                  >
                    {actionLoading ? "Verifying..." : "Verify & Login"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                      setDevOtp(null);
                    }}
                    className="h-11 w-full rounded-full border border-border bg-transparent text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
