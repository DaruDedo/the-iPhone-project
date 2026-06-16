import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ exists: false, isNew: true });
  }

  const db = getDb();
  if (!db) {
    // If DB is not configured, treat as new local user
    return NextResponse.json({ exists: false, isNew: true });
  }

  try {
    // Check users table
    const userExists = await db.query.users.findFirst({
      where: eq(schema.users.email, email),
    });

    if (userExists) {
      return NextResponse.json({ exists: true, isNew: false });
    }

    // Check orders table
    const orderExists = await db.query.orders.findFirst({
      where: eq(schema.orders.email, email),
    });

    if (orderExists) {
      return NextResponse.json({ exists: true, isNew: false });
    }

    return NextResponse.json({ exists: false, isNew: true });
  } catch (err) {
    console.error("Error checking email status:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
