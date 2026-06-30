import { desc, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { isAdminError, requireAdmin } from "@/lib/admin-auth";
import { getTimeframeStartDate } from "@/lib/timeframe";

export const dynamic = "force-dynamic";

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

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ leads: [], stats: {}, devMode: true });
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const startDate = getTimeframeStartDate(timeframe);

  // Get dynamic host to show localhost or production domain correctly
  const host = request.headers.get("host") || "theiphoneproject.com";
  const siteLabel = host.includes("localhost")
    ? "localhost site"
    : host.endsWith(".in") || host.includes(".in:")
      ? ".in site"
      : ".com site";

  try {
    // 1. Fetch real leads, events, and products from DB
    const [realLeads, realEvents, dbProducts] = await Promise.all([
      db.query.leads.findMany({
        where: gte(schema.leads.createdAt, startDate),
        orderBy: [desc(schema.leads.createdAt)],
        limit: 50,
      }),
      db.query.analyticsEvents.findMany({
        where: gte(schema.analyticsEvents.createdAt, startDate),
        orderBy: [desc(schema.analyticsEvents.createdAt)],
        limit: 100,
      }),
      db.query.products.findMany(),
    ]);

    // Build product price lookup map
    const productPriceMap = dbProducts.reduce((acc, p) => {
      acc[p.slug] = p.price;
      return acc;
    }, {} as Record<string, number>);

    // Define simulated leads
    const simulatedLeads: CartLead[] = [
      {
        id: "sim-1",
        name: "Ayush Katiyar",
        phone: "9369281958",
        email: "ayush@example.com",
        score: 57,
        status: "Checkout started",
        activeText: "Active about 16 hours ago",
        signalsCount: 3,
        site: siteLabel,
        domain: host,
        value: 799,
        summary: "Current value - 1 add-to-cart, 2 opens",
        hasReward: false,
        productTag: "Aventus",
        connectionText: "Checkout ₹799 INR",
        createdAt: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sim-2",
        name: "Unknown visitor",
        phone: "No contact yet",
        email: null,
        score: 32,
        status: "Checkout started",
        activeText: "Active about 2 hours ago",
        signalsCount: 9,
        site: siteLabel,
        domain: host,
        value: 799,
        summary: "Current value - 1 add-to-cart, 8 opens",
        hasReward: false,
        productTag: "Aventus",
        connectionText: "Checkout ₹799 INR",
        connectionDetail: "Dropped at fullName",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "sim-3",
        name: "Rohan Sharma",
        phone: "9876543210",
        email: "rohan@example.com",
        score: 84,
        status: "Checkout started",
        activeText: "Active about 30 mins ago",
        signalsCount: 5,
        site: siteLabel,
        domain: host,
        value: 1598,
        summary: "Current value - 2 add-to-cart, 3 opens",
        hasReward: true,
        productTag: "Miles Morales",
        connectionText: "Checkout ₹1,598 INR",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      }
    ];

    // Filter events
    const checkoutStartedEvents = realEvents.filter((e) => e.eventName === "checkout_started");
    const addToCartEvents = realEvents.filter((e) => e.eventName === "add_to_cart");

    // Group add-to-carts that were later checked out into the checkout entry
    const mappedAddEvents: CartLead[] = [];

    for (const addEvent of addToCartEvents) {
      const addPayload = addEvent.payload as Record<string, any>;
      const addTime = new Date(addEvent.createdAt).getTime();

      // Skip rendering if there's a checkout_started event within 15 minutes of this add_to_cart event
      const hasCheckoutStarted = checkoutStartedEvents.some((checkEvent) => {
        const checkTime = new Date(checkEvent.createdAt).getTime();
        return Math.abs(checkTime - addTime) < 900000;
      });

      if (hasCheckoutStarted) {
        continue;
      }

      const slug = addPayload?.productSlug as string;
      const basePrice = productPriceMap[slug] || (addPayload?.price as number) || 499;
      const qty = (addPayload?.quantity as number) || 1;
      const totalVal = basePrice * qty;

      mappedAddEvents.push({
        id: addEvent.id,
        name: "Unknown visitor",
        phone: addEvent.phone || "No contact yet",
        email: addEvent.email || null,
        score: 30,
        status: "Added to cart",
        activeText: `Active about ${new Date(addEvent.createdAt).toLocaleTimeString("en-IN")}`,
        signalsCount: 1,
        site: addEvent.source === "direct" ? siteLabel : `${addEvent.source} ref`,
        domain: host,
        value: totalVal,
        summary: `Current value - ${qty} add-to-cart`,
        hasReward: false,
        productTag: addPayload?.productName || "Premium Cover",
        connectionText: "In Cart",
        createdAt: addEvent.createdAt.toISOString(),
      });
    }

    // Map checkout_started events
    const mappedCheckoutEvents: CartLead[] = checkoutStartedEvents.map((event) => {
      const payload = event.payload as Record<string, any>;
      const items = (payload?.items as any[]) || [];
      const qty = (payload?.itemCount as number) || 1;
      const totalVal = (payload?.subtotal as number) || 799;
      const firstItemName = items[0]?.name || "Premium Cover";

      return {
        id: event.id,
        name: "Unknown visitor",
        phone: event.phone || "No contact yet",
        email: event.email || null,
        score: 45,
        status: "Checkout started",
        activeText: `Active about ${new Date(event.createdAt).toLocaleTimeString("en-IN")}`,
        signalsCount: 2,
        site: event.source === "direct" ? siteLabel : `${event.source} ref`,
        domain: host,
        value: totalVal,
        summary: `Current value - ${qty} items in cart`,
        hasReward: false,
        productTag: firstItemName,
        connectionText: `Checkout ₹${totalVal} INR`,
        createdAt: event.createdAt.toISOString(),
      };
    });

    // Map real leads table records (always checkout started)
    const mappedRealLeads: CartLead[] = realLeads.map((lead) => {
      const isCart = lead.type === "cart_lead";
      const val = (lead.payload?.value as number) || 799;

      return {
        id: lead.id,
        name: lead.name || "Unknown visitor",
        phone: lead.phone || "No contact yet",
        email: lead.email,
        score: isCart ? 25 : 60,
        status: isCart ? "Added to cart" : "Checkout started",
        activeText: `Active ${new Date(lead.lastActiveAt).toLocaleDateString("en-IN")}`,
        signalsCount: isCart ? 1 : 4,
        site: lead.source === "direct" ? siteLabel : `${lead.source} ref`,
        domain: host,
        value: val,
        summary: isCart ? "1 add-to-cart" : "1 add-to-cart, 3 opens",
        hasReward: false,
        productTag: (lead.payload?.productName as string) || "Premium Cover",
        connectionText: `Checkout ₹${val} INR`,
        createdAt: lead.createdAt.toISOString(),
      };
    });

    // Combine all real items
    const realCombined = [...mappedRealLeads, ...mappedCheckoutEvents, ...mappedAddEvents];

    // Sort by date newest first
    realCombined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Merge with simulated leads
    const allLeads = [...realCombined, ...simulatedLeads];

    // Compute stats based on the list
    const potentialCartLeads = allLeads.length;
    const connectedLeads = allLeads.filter((l) => l.phone !== "No contact yet").length;
    const couponConnected = allLeads.filter((l) => l.hasReward).length;
    const cartSignalValue = allLeads.reduce((acc, l) => acc + l.value, 0);
    const startedCheckoutCount = allLeads.filter((l) => l.status === "Checkout started").length;

    return NextResponse.json({
      leads: allLeads,
      stats: {
        potentialCartLeads,
        connectedLeads,
        couponConnected,
        cartSignalValue,
        startedCheckoutCount,
      },
      events: realEvents,
    });
  } catch (error) {
    return NextResponse.json(
      {
        leads: [],
        stats: {},
        events: [],
        error: error instanceof Error ? error.message : "Could not load leads data.",
      },
      { status: 500 },
    );
  }
}
