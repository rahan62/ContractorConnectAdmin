"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useState } from "react";

interface TrustStrengthTier {
  minPoints: number;
  label: string;
}

interface TrustStrengthConfig {
  experienceDefault: number;
  strengthPointsDefault: number;
  pointsPerTradeCategory: number;
  pointsIso9001: number;
  usdPerStrengthPoint: number;
  strengthTiersJson: TrustStrengthTier[] | null;
}

export default function TrustStrengthPage() {
  const [config, setConfig] = useState<TrustStrengthConfig | null>(null);
  const [tiersText, setTiersText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    experienceDefault: "",
    strengthPointsDefault: "",
    pointsPerTradeCategory: "",
    pointsIso9001: "",
    usdPerStrengthPoint: ""
  });

  async function load() {
    setLoading(true);
    const res = await adminFetch("/api/admin/trust-strength");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((json as { message?: string }).message ?? "Failed to load config");
      setLoading(false);
      return;
    }
    const c = (json as { config: TrustStrengthConfig }).config;
    setConfig(c);
    setForm({
      experienceDefault: String(c.experienceDefault),
      strengthPointsDefault: String(c.strengthPointsDefault),
      pointsPerTradeCategory: String(c.pointsPerTradeCategory),
      pointsIso9001: String(c.pointsIso9001),
      usdPerStrengthPoint: String(c.usdPerStrengthPoint)
    });
    setTiersText(JSON.stringify(c.strengthTiersJson ?? [], null, 2));
    setMessage(null);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    let tiers: TrustStrengthTier[] | null;
    try {
      const parsed = JSON.parse(tiersText || "[]") as unknown;
      if (!Array.isArray(parsed)) {
        setMessage("Strength tiers must be a JSON array.");
        return;
      }
      tiers = parsed as TrustStrengthTier[];
    } catch {
      setMessage("Invalid JSON for strength tiers.");
      return;
    }

    const res = await adminFetch("/api/admin/trust-strength", {
      method: "PATCH",
      body: JSON.stringify({
        experienceDefault: Number(form.experienceDefault),
        strengthPointsDefault: Number(form.strengthPointsDefault),
        pointsPerTradeCategory: Number(form.pointsPerTradeCategory),
        pointsIso9001: Number(form.pointsIso9001),
        usdPerStrengthPoint: Number(form.usdPerStrengthPoint),
        strengthTiersJson: tiers
      })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((json as { message?: string }).message ?? "Failed to save");
      return;
    }
    setMessage("Trust & strength configuration updated.");
    await load();
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Trust & strength scoring</h1>
          <p className="mt-1 text-sm text-slate-500">
            Defaults for new sub-contractors / field crews, points per trade category, ISO weight, USD→strength
            mapping, and letter thresholds (min strength points per label).
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        {loading || !config ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            Loading…
          </div>
        ) : (
          <section className="space-y-6 rounded-lg border border-slate-200 bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700">Experience default (0–100, before any job ratings)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.experienceDefault}
                  onChange={e => setForm(f => ({ ...f, experienceDefault: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700">Starting strength points (new registrations)</span>
                <input
                  type="number"
                  step="0.0001"
                  value={form.strengthPointsDefault}
                  onChange={e => setForm(f => ({ ...f, strengthPointsDefault: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700">Points per approved main trade category</span>
                <input
                  type="number"
                  step="0.0001"
                  value={form.pointsPerTradeCategory}
                  onChange={e => setForm(f => ({ ...f, pointsPerTradeCategory: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700">Points if company has ISO 9001 (profile flag)</span>
                <input
                  type="number"
                  step="0.0001"
                  value={form.pointsIso9001}
                  onChange={e => setForm(f => ({ ...f, pointsIso9001: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1 text-sm md:col-span-2">
                <span className="font-medium text-slate-700">
                  USD per one strength point from approved category evidence (e.g. 333333 ≈ $1M → ~3 pts)
                </span>
                <input
                  type="number"
                  step="1"
                  min={1}
                  value={form.usdPerStrengthPoint}
                  onChange={e => setForm(f => ({ ...f, usdPerStrengthPoint: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div>
              <label className="block space-y-1 text-sm">
                <span className="font-medium text-slate-700">
                  Strength tiers (JSON array: {"{"} minPoints, label {"}"} ascending)
                </span>
                <textarea
                  className="mt-1 w-full min-h-[220px] rounded border border-slate-300 px-3 py-2 font-mono text-xs"
                  value={tiersText}
                  onChange={e => setTiersText(e.target.value)}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => void save()}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Save configuration
            </button>
          </section>
        )}
      </main>
    </div>
  );
}
