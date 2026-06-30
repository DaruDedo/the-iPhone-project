"use client";

import Image from "next/image";
import Link from "next/link";
import { CreditCard, MapPin, ShieldCheck, Truck, Check, ChevronDown } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, useRef, type FormEvent } from "react";

import { getCartItemKey, useCart } from "@/components/cart-provider";
import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";
import { formatPrice } from "@/data/products";
import { siteConfig } from "@/lib/site";

const indianStates = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

const getLocalStateFromPincode = (pin: string): string => {
  const prefix2 = pin.substring(0, 2);
  switch (prefix2) {
    case "11": return "Delhi";
    case "12":
    case "13": return "Haryana";
    case "14":
    case "15":
    case "16": return "Punjab";
    case "17": return "Himachal Pradesh";
    case "18":
    case "19": return "Jammu and Kashmir";
    case "20":
    case "21":
    case "22":
    case "23":
    case "24":
    case "25":
    case "26":
    case "27":
    case "28": return "Uttar Pradesh";
    case "30":
    case "31":
    case "32":
    case "33":
    case "34": return "Rajasthan";
    case "36":
    case "37":
    case "38":
    case "39": return "Gujarat";
    case "40":
    case "41":
    case "42":
    case "43":
    case "44": return "Maharashtra";
    case "45":
    case "46":
    case "47":
    case "48": return "Madhya Pradesh";
    case "49": return "Chhattisgarh";
    case "50":
    case "51":
    case "52":
    case "53": return "Telangana";
    case "56":
    case "57":
    case "58":
    case "59": return "Karnataka";
    case "60":
    case "61":
    case "62":
    case "63":
    case "64": return "Tamil Nadu";
    case "67":
    case "68":
    case "69": return "Kerala";
    case "70":
    case "71":
    case "72":
    case "73":
    case "74": return "West Bengal";
    case "75":
    case "76":
    case "77": return "Odisha";
    case "78": return "Assam";
    case "80":
    case "81":
    case "82":
    case "83":
    case "84":
    case "85": return "Bihar";
    default: return "";
  }
};

function StateSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative w-full">
      <span className="font-display text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-400">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-1 sm:mt-2 flex h-12 w-full items-center justify-between rounded-2xl border border-border bg-card px-4 text-left text-sm outline-none focus:border-foreground/50 transition duration-150 cursor-pointer"
      >
        <span className="truncate font-medium text-foreground">{value || "Select state"}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-45 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-[0_22px_60px_rgba(0,0,0,0.18)] max-h-60 overflow-y-auto">
          {indianStates.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                onChange(st);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition hover:bg-muted ${
                value === st ? "bg-muted text-foreground" : "text-muted-foreground hover:text-zinc-200"
              }`}
            >
              {st}
              {value === st && <Check className="size-4 text-foreground" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CitySelector({
  label,
  value,
  onChange,
  placeholder,
  suggestions,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  suggestions: string[];
  onBlur: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchVal(value);
  }, [value]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const handleInputChange = (val: string) => {
    setSearchVal(val);
    onChange(val);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <span className="font-display text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-400">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="mt-1 sm:mt-2 flex h-12 w-full items-center justify-between rounded-2xl border border-border bg-card px-4 text-left text-sm outline-none focus:border-foreground/50 transition duration-150 cursor-pointer"
      >
        <span className={`truncate font-medium ${value ? "text-foreground" : "text-zinc-500"}`}>
          {value || "Search city"}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-45 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-[0_22px_60px_rgba(0,0,0,0.18)] flex flex-col gap-2">
          {/* Inner Search Text Field */}
          <div className="relative">
            <input
              type="text"
              required
              autoComplete="off"
              value={searchVal}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={onBlur}
              placeholder="Type city, village, or locality"
              className="h-10 w-full rounded-xl border border-border bg-background/50 px-3 text-xs outline-none focus:border-foreground/45"
            />
          </div>

          {/* Dynamic Area List */}
          {suggestions.length > 0 ? (
            <div className="max-h-48 overflow-y-auto pr-1 flex flex-col gap-0.5">
              {suggestions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition hover:bg-muted ${
                    value.toLowerCase() === c.toLowerCase()
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-zinc-200"
                  }`}
                >
                  {c}
                  {value.toLowerCase() === c.toLowerCase() && (
                    <Check className="size-3.5 text-foreground" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-2 py-2 text-[10px] text-zinc-500 font-medium font-sans">
              Type manually above to select your city
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [placedOrderDetails, setPlacedOrderDetails] = useState<{
    orderNumber: string;
    name: string;
    phone: string;
    total: number;
    paymentMethod: string;
  } | null>(null);

  // Generate or retrieve checkout session ID on mount
  const [checkoutSessionId] = useState(() => {
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("checkout_session_id");
      if (!id) {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          id = crypto.randomUUID();
        } else {
          id = "session-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();
        }
        sessionStorage.setItem("checkout_session_id", id);
      }
      return id;
    }
    return "";
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    pincode: "",
    city: "",
    state: "",
    address: "",
  });

  const [suggestedCities, setSuggestedCities] = useState<string[]>([]);

  // Calculate exited stage based on filled fields
  const getExitedStage = (data: typeof formData) => {
    if (!data.name.trim()) return "fullName";
    if (!data.phone.trim()) return "phone";
    if (!data.email.trim()) return "email";
    if (!data.pincode.trim()) return "pincode";
    if (!data.city.trim()) return "city";
    if (!data.state.trim()) return "state";
    if (!data.address.trim()) return "address";
    return "payment";
  };

  const saveDraft = useCallback(
    async (currentData: typeof formData) => {
      const exitedAt = getExitedStage(currentData);
      
      void fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "checkout_draft",
          eventName: "checkout_started",
          name: currentData.name || null,
          phone: currentData.phone || null,
          email: currentData.email || null,
          payload: {
            checkoutSessionId,
            exitedAt,
            address: currentData.address || null,
            pincode: currentData.pincode || null,
            city: currentData.city || null,
            state: currentData.state || null,
            subtotal,
            itemCount: items.reduce((total, item) => total + item.quantity, 0),
            items: items.map((item) => ({
              slug: item.slug,
              name: item.name,
              model: item.model,
              sku: item.sku,
              quantity: item.quantity,
            })),
          },
        }),
      }).catch(() => {});
    },
    [checkoutSessionId, subtotal, items]
  );

  const [detectedLocation, setDetectedLocation] = useState("");

  const lookupPincode = useCallback(
    async (pin: string) => {
      // 1. Instant local state pre-fill fallback (so state is selected instantly while API fetches)
      const localState = getLocalStateFromPincode(pin);
      if (localState) {
        setFormData((prev) => ({ ...prev, state: localState, pincode: pin }));
      }

      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        if (!res.ok) return;

        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffices = data[0].PostOffice;
          if (postOffices && postOffices.length > 0) {
            const cities = Array.from(new Set(postOffices.map((po: any) => po.Name))) as string[];
            setSuggestedCities(cities);

            const district = postOffices[0].District;
            const state = postOffices[0].State;
            setDetectedLocation(`${district}, ${state}`);

            setFormData((prev) => {
              const updated = { ...prev, city: district, state: state, pincode: pin };
              void saveDraft(updated);
              return updated;
            });
          }
        } else {
          setDetectedLocation("");
          setSuggestedCities([]);
        }
      } catch (err) {
        console.error("PIN code auto-lookup error:", err);
      }
    },
    [saveDraft]
  );

  // User Authentication pre-filling state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState("");

  useEffect(() => {
    async function checkUserSession() {
      try {
        const token = localStorage.getItem("user_session_token");
        const email = localStorage.getItem("user_session_email");

        if (token && email) {
          setIsLoggedIn(true);
          setLoggedInEmail(email);

          // Fetch profile details from backend
          const res = await fetch("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const profile = await res.json();
            const updated = {
              name: profile.name || "",
              phone: profile.phone || "",
              email: profile.email || email,
              pincode: profile.pincode || "",
              city: profile.city || "",
              state: profile.state || "",
              address: profile.address || "",
            };
            setFormData(updated);
            void saveDraft(updated);
          } else {
            setFormData((prev) => {
              const updated = { ...prev, email: email };
              void saveDraft(updated);
              return updated;
            });
          }
        } else {
          // Exited at start initial draft
          void saveDraft({
            name: "",
            phone: "",
            email: "",
            pincode: "",
            city: "",
            state: "",
            address: "",
          });
        }
      } catch (err) {
        console.error("Error loading session on checkout page:", err);
      }
    }
    checkUserSession();
  }, [saveDraft]);
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  const whatsappUrl = useMemo(() => {
    if (!placedOrderDetails || !siteConfig.whatsappPhone) return "";

    const message = `Hi The iPhone Project! I just placed an order.
Order Number: ${placedOrderDetails.orderNumber}
Name: ${placedOrderDetails.name}
Phone: ${placedOrderDetails.phone}
Total Amount: ${formatPrice(placedOrderDetails.total)}
Payment Method: ${placedOrderDetails.paymentMethod === "COD" ? "Cash on Delivery (COD)" : "UPI Payment"}

Please confirm my order!`;

    return `https://wa.me/${siteConfig.whatsappPhone}?text=${encodeURIComponent(message)}`;
  }, [placedOrderDetails]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    void fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "checkout_draft",
        eventName: "checkout_started",
        name: form.get("name"),
        phone: form.get("phone"),
        email: form.get("email"),
        payload: {
          subtotal,
          itemCount: items.reduce((total, item) => total + item.quantity, 0),
          items: items.map((item) => ({
            slug: item.slug,
            name: item.name,
            model: item.model,
            sku: item.sku,
            quantity: item.quantity,
          })),
        },
      }),
    }).catch(() => {});

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: {
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          pincode: form.get("pincode"),
          address: `${form.get("address")}, ${formData.city}, ${formData.state}`,
        },
        paymentMethod: form.get("payment"),
        items: items.map((item) => ({
          variantId: item.variantId,
          productId: item.productId,
          slug: item.slug,
          modelId: item.modelId,
          modelSlug: item.modelSlug,
          quantity: item.quantity,
        })),
      }),
    });
    const result = (await response.json()) as { orderNumber?: string; error?: string };

    setIsSubmitting(false);

    if (!response.ok || !result.orderNumber) {
      setError(result.error ?? "Could not place your order. Please try again.");
      return;
    }

    clearCart();
    setPlacedOrderDetails({
      orderNumber: result.orderNumber,
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      total: total,
      paymentMethod: String(form.get("payment")),
    });
    setOrderNumber(result.orderNumber);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 lg:grid-cols-[1fr_420px] lg:py-20">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Secure checkout
          </p>
          <h1 className="text-4xl font-bold md:text-6xl">Finish your order.</h1>

          {orderNumber ? (
            <div className="mt-12 rounded-3xl bg-muted/50 p-6 sm:p-10 text-center space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  Order received
                </p>
                <h2 className="mt-3 text-3xl font-bold">Thank you.</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  Your order number is{" "}
                  <span className="font-medium text-foreground">{orderNumber}</span>.
                </p>
              </div>

              {placedOrderDetails?.paymentMethod === "UPI" && (
                <div className="mx-auto max-w-md border border-amber-200 bg-amber-50/50 p-5 rounded-2xl space-y-3 dark:bg-amber-950/10 dark:border-amber-900/30">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                    UPI Payment Verification
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Please send{" "}
                    <strong className="text-foreground">
                      {formatPrice(placedOrderDetails.total)}
                    </strong>{" "}
                    to our official UPI ID:{" "}
                    <code className="bg-background px-1.5 py-0.5 rounded border font-bold text-foreground font-mono">
                      {siteConfig.upiId}
                    </code>{" "}
                    or verify on WhatsApp.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba59] px-6 py-2.5 text-sm font-semibold text-white transition"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.202-1.362a9.92 9.92 0 0 0 4.808 1.24h.005c5.505 0 9.99-4.479 9.99-9.987C22.007 6.478 17.521 2 12.012 2zm5.727 14.12c-.25.707-1.464 1.3-2.008 1.383-.49.076-1.127.135-3.266-.752-2.735-1.135-4.5-3.914-4.637-4.096-.137-.182-1.107-1.472-1.107-2.81 0-1.337.7-1.996.95-2.262.25-.266.545-.333.727-.333h.523c.182 0 .428-.067.668.514.25.602.85 2.083.923 2.23.072.15.12.327.02.523-.1.196-.15.319-.296.49-.145.17-.304.382-.435.513-.146.147-.3.308-.13.602.17.294.755 1.25 1.623 2.023.717.638 1.32.836 1.603.954.282.118.446.1.614-.095.168-.196.726-.847.922-1.137.196-.29.39-.24.66-.14.27.1.1.722.56.924.46.202 2.9.155 3.396.9.197.29.3.626.046 1.332z" />
                    </svg>
                    Confirm on WhatsApp
                  </a>
                )}
                <Link
                  href={`/track-order`}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition"
                >
                  Track order
                </Link>
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-border px-6 py-2.5 text-sm font-semibold hover:border-foreground/35 transition"
                >
                  Continue shopping
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="mt-12 rounded-3xl bg-muted/50 p-10 text-center">
              <h2 className="text-2xl font-bold">Your bag is empty.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Add a cover from The iPhone Project before checkout. Your selected model, colour,
                and quantity will appear here.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
              >
                Shop covers
              </Link>
            </div>
          ) : (
            <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-foreground">
                  {error}
                </div>
              )}
              <section className="rounded-3xl border border-border p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <MapPin size={18} />
                  <h2 className="text-xl font-bold">Delivery details</h2>
                </div>
                {isLoggedIn && (
                  <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100/50 p-3.5 text-xs text-emerald-800 font-sans">
                    Logged in as <strong className="font-bold">{loggedInEmail}</strong>. Your
                    shipping details are pre-filled.
                  </div>
                )}
                 <div className="grid gap-2.5 sm:gap-4 md:grid-cols-2">
                  {[
                    ["Full name", "Aarav Sharma", "name"],
                    ["Phone", "10-digit mobile number", "phone"],
                    ["Email", "you@email.com", "email"],
                    ["PIN code", "560001", "pincode"],
                    ["State", "Uttar Pradesh", "state"],
                    ["City", "Kanpur Nagar", "city"],
                  ].map(([label, placeholder, name]) => {
                    if (name === "state") {
                      return (
                        <StateSelector
                          key={label}
                          label={label}
                          value={formData.state}
                          onChange={(val) => {
                            setFormData((prev) => {
                              const updated = { ...prev, state: val };
                              void saveDraft(updated);
                              return updated;
                            });
                          }}
                        />
                      );
                    }

                    if (name === "city") {
                      return (
                        <CitySelector
                          key={label}
                          label={label}
                          value={formData.city}
                          onChange={(val) => {
                            setFormData((prev) => {
                              const updated = { ...prev, city: val };
                              return updated;
                            });
                          }}
                          placeholder={placeholder}
                          suggestions={suggestedCities}
                          onBlur={() => saveDraft(formData)}
                        />
                      );
                    }

                    return (
                      <label key={label} className="block">
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-400">
                          {label}
                        </span>
                        <input
                          name={name}
                          required
                          value={formData[name as keyof typeof formData]}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const updated = { ...prev, [name]: val };
                              if (name === "pincode") {
                                if (val.trim().length === 6) {
                                  void lookupPincode(val.trim());
                                } else {
                                  setDetectedLocation("");
                                  setSuggestedCities([]);
                                }
                              }
                              return updated;
                            });
                          }}
                          onBlur={() => saveDraft(formData)}
                          placeholder={placeholder}
                          className="mt-1 sm:mt-2 h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none focus:border-foreground/50"
                        />
                        {name === "pincode" && detectedLocation && (
                          <p className="mt-1.5 text-[10px] font-semibold text-emerald-500 font-sans flex items-center gap-1.5 animate-fade-in pl-1">
                            <span className="text-xs">📍</span> Auto-detected: {detectedLocation}
                          </p>
                        )}
                      </label>
                    );
                  })}
                  <label className="block md:col-span-2">
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-400">
                      Address
                    </span>
                    <textarea
                      name="address"
                      required
                      rows={4}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      onBlur={() => saveDraft(formData)}
                      placeholder="House number, street, area, city, state"
                      className="mt-1 sm:mt-2 w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-foreground/50"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-3xl border border-border p-4 sm:p-6">
                <div className="mb-5 flex items-center gap-2">
                  <CreditCard size={18} />
                  <h2 className="text-xl font-bold">Payment</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["UPI", "UPI"],
                    ["Cash on delivery", "COD"],
                  ].map(([method, value], index) => (
                    <label
                      key={method}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-4 text-sm"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        defaultChecked={index === 0}
                        className="accent-foreground"
                      />
                      {method}
                    </label>
                  ))}
                </div>
              </section>

              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-full bg-foreground px-6 text-sm font-medium text-background transition hover:opacity-90 md:w-auto"
              >
                {isSubmitting ? "Placing order..." : "Place order"}
              </button>
            </form>
          )}
        </div>

        <aside className="h-fit rounded-3xl bg-muted/40 p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="mt-6 space-y-5">
            {items.map((item) => {
              const key = getCartItemKey(item);
              return (
                <article key={key} className="grid grid-cols-[72px_1fr] gap-4">
                  <div
                    className="relative aspect-square overflow-hidden bg-background"
                    style={{
                      clipPath:
                        "polygon(8% 0, 92% 0, 100% 8%, 100% 92%, 92% 100%, 8% 100%, 0 92%, 0 8%)",
                    }}
                  >
                    <Image
                      src={item.imageSrc}
                      alt={`${item.name} case`}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                    {/* SVG Border Overlay */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      <path
                        d="M 8 0 L 92 0 L 100 8 L 100 92 L 92 100 L 8 100 L 0 92 L 0 8 Z"
                        stroke="var(--color-border)"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="flex justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold">{item.name}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.model} / {item.color}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <select
                      value={item.quantity}
                      onChange={(event) => updateQuantity(key, Number(event.target.value))}
                      className="mt-3 h-9 rounded-full border border-border bg-background px-3 text-xs outline-none"
                    >
                      {[1, 2, 3, 4, 5].map((quantity) => (
                        <option key={quantity} value={quantity}>
                          Qty {quantity}
                        </option>
                      ))}
                    </select>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className={shipping === 0 ? "" : "font-mono"}>
                {shipping === 0 ? "Free" : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between pt-3 text-base font-bold">
              <span>Total</span>
              <span className="font-mono">{formatPrice(total)}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-xs text-muted-foreground">
            {[
              { icon: Truck, text: "Ships in 24 hours from Bengaluru" },
              { icon: ShieldCheck, text: "Protected checkout and easy returns" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={15} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
