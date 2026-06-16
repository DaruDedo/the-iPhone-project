import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import * as schema from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate random 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const db = getDb();
    if (db) {
      // Save code to database
      await db.insert(schema.otps).values({
        email: cleanEmail,
        code,
        expiresAt,
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // If Resend API key is available, send email
    if (resendApiKey) {
      console.log(`Sending OTP email via Resend to ${cleanEmail}`);
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: cleanEmail,
          subject: "Your OTP Verification Code",
          html: `
            <div style="font-family: sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px;">
              <h2 style="color: #ff5500; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Verification Code</h2>
              <p>Your one-time password (OTP) verification code is:</p>
              <div style="background-color: #f7f7f7; font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; color: #111;">
                ${code}
              </div>
              <p style="color: #666; font-size: 14px;">This code is valid for 10 minutes. Please do not share this code with anyone.</p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Resend API error:", errText);
        // Fallback to devMode if Resend failed due to unverified domain or other configuration issue
        return NextResponse.json({
          success: true,
          devMode: true,
          code,
          error: "Resend failed to send email: " + errText,
        });
      }

      return NextResponse.json({ success: true });
    } else {
      // No Resend API key: run in developer mode and return code in response
      console.log(`[DEV MODE] OTP generated for ${cleanEmail}: ${code}`);
      return NextResponse.json({ success: true, devMode: true, code });
    }
  } catch (err) {
    console.error("Error in OTP send route:", err);
    return NextResponse.json({
      error: "Internal Server Error",
      details: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
