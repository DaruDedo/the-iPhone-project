import { desc, eq, gte, and } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { isAdminError, requireAdmin } from "@/lib/admin-auth";
import { getTimeframeStartDate } from "@/lib/timeframe";

export const dynamic = "force-dynamic";

type CheckoutDraftResponse = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pincode: string;
  value: number;
  itemCount: number;
  items: any[];
  exitedAt: string;
  exitBadge: string;
  badgeColor: string;
  activeText: string;
  source: string;
  createdAt: string;
};

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ checkouts: [], devMode: true });
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const startDate = getTimeframeStartDate(timeframe);

  try {
    const drafts = await db.query.leads.findMany({
      where: and(
        eq(schema.leads.type, "checkout_draft"),
        gte(schema.leads.createdAt, startDate)
      ),
      orderBy: [desc(schema.leads.createdAt)],
      limit: 100,
    });

    const checkouts: CheckoutDraftResponse[] = drafts.map((d) => {
      const payload = (d.payload as Record<string, any>) || {};
      const exitedAt = (payload.exitedAt as string) || "fullName";
      
      let exitBadge = "Exited at start";
      let badgeColor = "text-red-400 bg-red-500/10 border-red-500/20";

      switch (exitedAt) {
        case "fullName":
          exitBadge = "Exited at start";
          badgeColor = "text-red-400 bg-red-500/10 border-red-500/20";
          break;
        case "phone":
          exitBadge = "Exited at mobile";
          badgeColor = "text-orange-400 bg-orange-500/10 border-orange-500/20";
          break;
        case "email":
          exitBadge = "Exited at email";
          badgeColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
          break;
        case "pincode":
          exitBadge = "Exited at PIN code";
          badgeColor = "text-blue-400 bg-blue-500/10 border-blue-500/20";
          break;
        case "address":
          exitBadge = "Exited at address";
          badgeColor = "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
          break;
        case "payment":
          exitBadge = "Exited at payment";
          badgeColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
          break;
      }

      return {
        id: d.id,
        name: d.name || "Unknown visitor",
        phone: d.phone || "No contact yet",
        email: d.email || "No email yet",
        address: (payload.address as string) || "No address yet",
        pincode: (payload.pincode as string) || "No PIN yet",
        value: (payload.subtotal as number) || 0,
        itemCount: (payload.itemCount as number) || 0,
        items: (payload.items as any[]) || [],
        exitedAt,
        exitBadge,
        badgeColor,
        activeText: `Active ${new Date(d.lastActiveAt).toLocaleString("en-IN")}`,
        source: d.source || "direct",
        createdAt: d.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ checkouts });
  } catch (error) {
    return NextResponse.json(
      { checkouts: [], error: error instanceof Error ? error.message : "Failed to load checkouts." },
      { status: 500 }
    );
  }
}
