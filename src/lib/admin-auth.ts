import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseServiceClient,
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase/server";

type AdminContext = {
  supabase: SupabaseClient | null;
  email: string;
};

type AdminError = NextResponse<{ error: string }>;

export async function requireAdmin(request: Request): Promise<AdminContext | AdminError> {
  if (!isSupabaseConfigured()) {
    return { supabase: null, email: "dev@local.test" };
  }

  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required for admin actions." },
      { status: 500 },
    );
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Admin login required." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase!.auth.getUser(token);
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const userEmail = data.user?.email?.toLowerCase();

  if (error || !userEmail || !adminEmail || userEmail !== adminEmail) {
    return NextResponse.json({ error: "You are not allowed to access admin." }, { status: 403 });
  }

  return { supabase, email: userEmail };
}

export function isAdminError(value: Awaited<ReturnType<typeof requireAdmin>>): value is AdminError {
  return value instanceof NextResponse;
}
