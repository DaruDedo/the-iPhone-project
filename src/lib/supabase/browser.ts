"use client";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let cachedClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  cachedClient ??= createClient(supabaseUrl, supabaseAnonKey);
  return cachedClient;
}

export async function getSupabaseBrowserClientAsync() {
  const existing = getSupabaseBrowserClient();

  if (existing) {
    return existing;
  }

  const response = await fetch("/api/supabase-config");

  if (!response.ok) {
    return null;
  }

  const config = (await response.json()) as { url?: string; anonKey?: string };

  if (!config.url || !config.anonKey) {
    return null;
  }

  cachedClient ??= createClient(config.url, config.anonKey);
  return cachedClient;
}
