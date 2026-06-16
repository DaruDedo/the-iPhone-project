import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import * as schema from "@/db/schema";
import { verifyToken } from "@/lib/jwt";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function getUserFromToken(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  // 1. Try to verify as custom JWT first
  const customUser = verifyToken(token);
  if (customUser) {
    const db = getDb();
    let userId = "user-id-" + customUser.email;
    if (db) {
      try {
        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, customUser.email),
        });
        if (user) {
          userId = user.id;
        }
      } catch (err) {
        console.error("Database user query error in auth helper:", err);
      }
    }
    return {
      email: customUser.email,
      id: userId,
    };
  }

  // 2. Try Supabase verification (for Admins or legacy sessions)
  const supabase = getSupabaseServiceClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user && data.user.email) {
        return {
          email: data.user.email.toLowerCase(),
          id: data.user.id,
        };
      }
    } catch (err) {
      console.error("Supabase user retrieval error:", err);
    }
  }

  // 3. Fallback for Local Dev Mode (mock token)
  if (token.startsWith("mock_")) {
    const email = token.replace("mock_", "").toLowerCase();
    return {
      email,
      id: "mock-id-" + email,
    };
  }

  return null;
}
