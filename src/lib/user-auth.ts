import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function getUserFromToken(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    // Local Dev Mode Fallback:
    // If Supabase is not configured, we allow client-side mock authentication.
    // Client sends "mock_user@email.com" as the Bearer token.
    if (token.startsWith("mock_")) {
      const email = token.replace("mock_", "").toLowerCase();
      return { email, id: "mock-id-" + email };
    }
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user || !data.user.email) return null;
    return {
      email: data.user.email.toLowerCase(),
      id: data.user.id,
    };
  } catch (err) {
    console.error("Supabase user retrieval error:", err);
    return null;
  }
}
