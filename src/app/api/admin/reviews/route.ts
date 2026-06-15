import { desc, eq } from "drizzle-orm";
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
    return NextResponse.json({ reviews: [], devMode: true });
  }

  try {
    const reviews = await db.query.productReviews.findMany({
      orderBy: [desc(schema.productReviews.createdAt)],
      with: {
        product: true,
      },
    });

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review.id,
        productId: review.productId,
        productName: review.product?.name ?? "Unknown Product",
        name: review.name,
        city: review.city,
        rating: review.rating,
        quote: review.quote,
        isApproved: review.isApproved,
        createdAt: review.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load reviews." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();
  const body = (await request.json()) as {
    productId: string;
    name: string;
    city: string;
    rating: number;
    quote: string;
    isApproved?: boolean;
  };

  if (!body.productId || !body.name || !body.city || !body.rating || !body.quote) {
    return NextResponse.json({ error: "Missing required review fields." }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ ok: true, devMode: true });
  }

  try {
    const [review] = await db
      .insert(schema.productReviews)
      .values({
        productId: body.productId,
        name: body.name,
        city: body.city,
        rating: Math.min(5, Math.max(1, body.rating)),
        quote: body.quote,
        isApproved: body.isApproved ?? true,
      })
      .returning();

    return NextResponse.json({ ok: true, review });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create review." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();
  const body = (await request.json()) as { reviewId?: string; isApproved?: boolean };

  if (!body.reviewId || body.isApproved === undefined) {
    return NextResponse.json(
      { error: "Review ID and approval status are required." },
      { status: 400 },
    );
  }

  if (!db) {
    return NextResponse.json({ ok: true, devMode: true });
  }

  try {
    await db
      .update(schema.productReviews)
      .set({ isApproved: body.isApproved })
      .where(eq(schema.productReviews.id, body.reviewId));

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update review." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();
  const url = new URL(request.url);
  const reviewId = url.searchParams.get("id");

  if (!reviewId) {
    return NextResponse.json({ error: "Review ID is required." }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ ok: true, devMode: true });
  }

  try {
    await db.delete(schema.productReviews).where(eq(schema.productReviews.id, reviewId));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete review." },
      { status: 500 },
    );
  }
}
