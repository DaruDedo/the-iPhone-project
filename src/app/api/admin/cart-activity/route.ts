import { desc, eq, gte, and } from "drizzle-orm";
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
    return NextResponse.json({ events: [], devMode: true });
  }

  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get("timeframe");
  const startDate = getTimeframeStartDate(timeframe);

  try {
    const events = await db.query.analyticsEvents.findMany({
      where: and(
        eq(schema.analyticsEvents.eventName, "add_to_cart"),
        gte(schema.analyticsEvents.createdAt, startDate)
      ),
      orderBy: [desc(schema.analyticsEvents.createdAt)],
      limit: 100,
    });

    return NextResponse.json({ events });
  } catch (error) {
    return NextResponse.json(
      {
        events: [],
        error:
          error instanceof Error
            ? error.message
            : "Could not load cart activity.",
      },
      { status: 500 },
    );
  }
}
