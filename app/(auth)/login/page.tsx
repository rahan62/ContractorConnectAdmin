"use client";

import { FormEvent, useEffect, useState } from "react";
import { setAdminSession } from "@/lib/adminApi";

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:4000";
const TURNSTILE_ENABLED = process.env.NEXT_PUBLIC_ADMIN_TURNSTILE_ENABLED !== "false";
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!TURNSTILE_ENABLED || !TURNSTILE_SITE_KEY) return;
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${ADMIN_API_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          turnstileToken
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Login failed");
      }

      const data = await res.json();
      setAdminSession(data);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border border-slate-800 bg-slate-900 px-6 py-5 shadow-lg"
      >
        <h1 className="text-xl font-semibold">Admin login</h1>
        <div className="space-y-1 text-sm">
          <label className="block text-slate-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-blue-500"
            required
          />
        </div>
        <div className="space-y-1 text-sm">
          <label className="block text-slate-200">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-50 outline-none focus:border-blue-500"
            required
          />
        </div>
        {TURNSTILE_ENABLED && TURNSTILE_SITE_KEY && (
          <div
            className="cf-turnstile mt-2"
            data-sitekey={TURNSTILE_SITE_KEY}
            data-callback="onTurnstileSuccess"
          />
        )}
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

