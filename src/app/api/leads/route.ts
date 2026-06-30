import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { toTenDigitPhone } from "@/lib/phone";

type LeadPayload = {
  type?: string;
  eventName?: string;
  name?: string;
  phone?: string;
  email?: string;
  source?: string;
  payload?: Record<string, unknown>;
};

function getSource(request: Request, explicitSource?: string) {
  if (explicitSource) {
    return explicitSource;
  }

  const referer = request.headers.get("referer") ?? "";

  if (referer.includes("instagram")) return "instagram";
  if (referer.includes("google")) return "google";
  if (referer.includes("chatgpt") || referer.includes("perplexity")) return "ai";
  if (referer.includes("wa.me") || referer.includes("whatsapp")) return "whatsapp";

  return referer ? "referral" : "direct";
}

export async function POST(request: Request) {
  const db = getDb();
  const body = (await request.json()) as LeadPayload;
  const source = getSource(request, body.source);
  const cleanPhone = body.phone ? toTenDigitPhone(body.phone) : null;
  const payload = body.payload ?? {};

  if (!db) {
    return NextResponse.json({ ok: true, devMode: true });
  }

  try {
    if (body.eventName) {
      await db.insert(schema.analyticsEvents).values({
        eventName: body.eventName,
        source,
        phone: cleanPhone,
        email: body.email ?? null,
        payload,
      });
    }

    if (body.type) {
      const checkoutSessionId = payload.checkoutSessionId as string | undefined;
      let existingLead = null;

      if (checkoutSessionId) {
        existingLead = await db.query.leads.findFirst({
          where: sql`${schema.leads.payload}->>'checkoutSessionId' = ${checkoutSessionId}`,
        });
      }

      if (existingLead) {
        // Update existing lead progress
        await db
          .update(schema.leads)
          .set({
            name: body.name || existingLead.name,
            phone: cleanPhone || existingLead.phone,
            email: body.email || existingLead.email,
            payload: {
              ...(existingLead.payload as Record<string, any>),
              ...payload,
            },
            lastActiveAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(schema.leads.id, existingLead.id));
      } else {
        // Create new lead record
        await db.insert(schema.leads).values({
          type: body.type,
          name: body.name ?? null,
          phone: cleanPhone,
          email: body.email ?? null,
          source,
          payload,
          lastActiveAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not save lead.",
      },
      { status: 500 },
    );
  }
}
