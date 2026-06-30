import { desc, eq, gte, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { isAdminError, requireAdmin } from "@/lib/admin-auth";
import { getTimeframeStartDate } from "@/lib/timeframe";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({
      sources: {},
      searches: [],
      products: [],
      devMode: true,
    });
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const startDate = getTimeframeStartDate(timeframe);

  try {
    // 1. Fetch traffic source distribution from analytics events filtered by timeframe
    const sourceRows = await db
      .select({
        source: schema.analyticsEvents.source,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.analyticsEvents)
      .where(gte(schema.analyticsEvents.createdAt, startDate))
      .groupBy(schema.analyticsEvents.source);

    const sources = sourceRows.reduce((acc, row) => {
      acc[row.source] = row.count;
      return acc;
    }, {} as Record<string, number>);

    // 2. Fetch recent search queries filtered by timeframe
    const searches = await db.query.analyticsEvents.findMany({
      where: and(
        eq(schema.analyticsEvents.eventName, "search"),
        gte(schema.analyticsEvents.createdAt, startDate)
      ),
      orderBy: [desc(schema.analyticsEvents.createdAt)],
      limit: 100,
    });

    // 3. Fetch products to run the AI Visibility Audit (always audit all current products)
    const products = await db.query.products.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        description: true,
        seoTitle: true,
        seoDescription: true,
      },
      with: {
        features: true,
      },
    });

    return NextResponse.json({
      sources,
      searches,
      products: products.map((p) => {
        const hasDesc = !!p.description?.trim();
        const hasSeoTitle = !!p.seoTitle?.trim();
        const hasSeoDesc = !!p.seoDescription?.trim();
        const hasFeatures = (p.features ?? []).length > 0;

        let score = 0;
        if (hasDesc) score += 25;
        if (hasSeoTitle) score += 25;
        if (hasSeoDesc) score += 25;
        if (hasFeatures) score += 25;

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          score,
          details: {
            hasDesc,
            hasSeoTitle,
            hasSeoDesc,
            hasFeatures,
          },
        };
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        sources: {},
        searches: [],
        products: [],
        error: error instanceof Error ? error.message : "Failed to load AI visibility audit.",
      },
      { status: 500 },
    );
  }
}
