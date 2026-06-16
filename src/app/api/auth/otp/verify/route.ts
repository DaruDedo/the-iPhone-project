import { and, desc, eq, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { createToken } from "@/lib/jwt";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
    const cleanEmail = email?.toLowerCase().trim();
    const cleanCode = code?.trim();

    if (!cleanEmail || !cleanCode) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      // Dev Mode fallback when no database is configured
      if (cleanCode === "123456" || cleanCode.length === 6) {
        const token = createToken({ email: cleanEmail });
        return NextResponse.json({ success: true, token });
      }
      return NextResponse.json({ error: "Invalid code (Dev Mode)" }, { status: 400 });
    }

    // Find the latest active OTP for this email
    const now = new Date();
    const latestOtp = await db.query.otps.findFirst({
      where: and(
        eq(schema.otps.email, cleanEmail),
        gt(schema.otps.expiresAt, now)
      ),
      orderBy: [desc(schema.otps.createdAt)],
    });

    if (!latestOtp) {
      return NextResponse.json({ error: "OTP expired or not found. Please request a new one." }, { status: 400 });
    }

    if (latestOtp.code !== cleanCode) {
      return NextResponse.json({ error: "Invalid verification code. Please check and try again." }, { status: 400 });
    }

    // OTP matches! Clean up codes for this email
    await db.delete(schema.otps).where(eq(schema.otps.email, cleanEmail));

    // Ensure user exists in users table (so we have a record)
    const userExists = await db.query.users.findFirst({
      where: eq(schema.users.email, cleanEmail),
    });

    if (!userExists) {
      // Auto-insert user with empty details (will be completed during registration/checkout)
      await db.insert(schema.users).values({
        email: cleanEmail,
      });
    }

    // Generate JWT token
    const token = createToken({ email: cleanEmail });

    return NextResponse.json({ success: true, token });
  } catch (err: any) {
    console.error("Error in OTP verify route:", err);
    let details = err instanceof Error ? err.message : String(err);
    if (err && typeof err === "object") {
      if (err.detail) details += " | Detail: " + err.detail;
      if (err.hint) details += " | Hint: " + err.hint;
      if (err.code) details += " | Code: " + err.code;
    }
    const isProduction = Boolean(process.env.RESEND_API_KEY);
    return NextResponse.json({
      error: "Internal Server Error",
      details: isProduction ? undefined : details,
    }, { status: 500 });
  }
}
