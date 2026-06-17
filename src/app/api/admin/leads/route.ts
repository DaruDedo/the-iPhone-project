import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { isAdminError, requireAdmin } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json({ leads: [], events: [], devMode: true });
  }

  try {
    const [leads, events] = await Promise.all([
      db.query.leads.findMany({
        orderBy: [desc(schema.leads.createdAt)],
        limit: 100,
      }),
      db.query.analyticsEvents.findMany({
        orderBy: [desc(schema.analyticsEvents.createdAt)],
        limit: 100,
      }),
    ]);

    return NextResponse.json({ leads, events });
  } catch (error) {
    return NextResponse.json(
      {
        leads: [],
        events: [],
        error:
          error instanceof Error
            ? error.message
            : "Could not load leads. Run sales-system-migration.sql.",
      },
      { status: 500 },
    );
  }
}
