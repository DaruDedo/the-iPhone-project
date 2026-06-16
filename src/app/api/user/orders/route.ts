import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { getUserFromToken } from "@/lib/user-auth";

export async function GET(request: Request) {
  const user = await getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const userOrders = await db.query.orders.findMany({
      where: eq(schema.orders.email, user.email),
      with: {
        items: true,
      },
      orderBy: [desc(schema.orders.createdAt)],
    });

    return NextResponse.json(userOrders);
  } catch (err) {
    console.error("Error retrieving user orders:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
