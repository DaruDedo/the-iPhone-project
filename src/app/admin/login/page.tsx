"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { getSupabaseBrowserClientAsync } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const supabase = await getSupabaseBrowserClientAsync();

    if (!supabase) {
      setError("Add Supabase env vars before using admin login.");
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-background px-3 py-16 text-foreground sm:px-6">
      <section className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          Back to store
        </Link>
        <div className="mt-10 rounded-3xl border border-border bg-card p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</p>
          <h1 className="mt-3 text-4xl font-bold">Login.</h1>
          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl bg-destructive/10 p-3 text-sm text-foreground">
                {error}
              </div>
            )}
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground/50"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </span>
              <input
                name="password"
                type="password"
                required
                className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none focus:border-foreground/50"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-full bg-foreground px-6 text-sm font-medium text-background"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
