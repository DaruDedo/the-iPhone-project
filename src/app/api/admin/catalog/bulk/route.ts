import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import { createCatalogProduct, type AdminProductPayload } from "@/lib/admin-catalog-writer";
import { isAdminError, requireAdmin } from "@/lib/admin-auth";

type BulkPayload = {
  products?: AdminProductPayload[];
};

export async function POST(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  const db = getDb();

  if (!db) {
    return NextResponse.json(
      { error: "DATABASE_URL is missing. Add it to .env.local before creating products." },
      { status: 503 },
    );
  }

  const payload = (await request.json()) as BulkPayload;
  const products = payload.products ?? [];

  if (products.length === 0) {
    return NextResponse.json({ error: "Add at least one product." }, { status: 400 });
  }

  if (products.length > 50) {
    return NextResponse.json(
      { error: "Bulk upload supports up to 50 products at once." },
      { status: 400 },
    );
  }

  const created: Array<{ slug: string }> = [];

  try {
    for (const product of products) {
      const createdProduct = await createCatalogProduct(db, product);
      created.push({ slug: createdProduct.slug });
    }

    return NextResponse.json({ ok: true, created });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not create bulk products.",
        created,
      },
      { status: 500 },
    );
  }
}
