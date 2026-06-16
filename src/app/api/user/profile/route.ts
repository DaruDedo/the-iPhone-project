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
    // 1. Check if user already exists in the users table
    let profile = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email),
    });

    // 2. If not in users table, check orders history for returning customer
    if (!profile) {
      const latestOrder = await db.query.orders.findFirst({
        where: eq(schema.orders.email, user.email),
        orderBy: [desc(schema.orders.createdAt)],
      });

      if (latestOrder) {
        // Automatically register the user using their latest order details
        const [newProfile] = await db
          .insert(schema.users)
          .values({
            email: user.email,
            name: latestOrder.customerName,
            phone: latestOrder.phone,
            address: latestOrder.address,
            pincode: latestOrder.pincode,
          })
          .returning();
        profile = newProfile;
      }
    }

    // 3. Determine if the user is an admin
    let isAdmin = false;
    const adminEmailEnv = process.env.ADMIN_EMAIL?.toLowerCase();
    if (user.email === adminEmailEnv) {
      isAdmin = true;
    } else {
      const adminDbRecord = await db.query.adminUsers.findFirst({
        where: eq(schema.adminUsers.email, user.email),
      });
      if (adminDbRecord) {
        isAdmin = true;
      }
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found", email: user.email, isAdmin },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...profile,
      isAdmin,
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getUserFromToken(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { name, phone, address, pincode } = await request.json();

    if (!name || !phone || !address || !pincode) {
      return NextResponse.json({ error: "All profile details are required." }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email),
    });

    let profile;
    if (existing) {
      const [updated] = await db
        .update(schema.users)
        .set({
          name,
          phone,
          address,
          pincode,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.email, user.email))
        .returning();
      profile = updated;
    } else {
      const [created] = await db
        .insert(schema.users)
        .values({
          email: user.email,
          name,
          phone,
          address,
          pincode,
        })
        .returning();
      profile = created;
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("Error updating user profile:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
