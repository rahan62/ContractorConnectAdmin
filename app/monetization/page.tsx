"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useState } from "react";

interface MonetizationData {
  config: {
    monthlySubscriptionPrice: number;
    yearlySubscriptionPrice: number;
    featuredListingPrice: number;
    tokenUnitPrice: number;
    vatRate: number;
  };
  stats: {
    completedRevenue: number;
    completedPayments: number;
    refundedRevenue: number;
    refundedPayments: number;
    totalUsers: number;
    activeContracts: number;
  };
}

export default function MonetizationPage() {
  const [data, setData] = useState<MonetizationData | null>(null);
  const [form, setForm] = useState({
    monthlySubscriptionPrice: "",
    yearlySubscriptionPrice: "",
    featuredListingPrice: "",
    tokenUnitPrice: "",
    vatRate: ""
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await adminFetch("/api/admin/monetization");
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json.message ?? "Failed to load monetization data");
      setLoading(false);
      return;
    }

    setData(json);
    setForm({
      monthlySubscriptionPrice: String(json.config.monthlySubscriptionPrice),
      yearlySubscriptionPrice: String(json.config.yearlySubscriptionPrice),
      featuredListingPrice: String(json.config.featuredListingPrice),
      tokenUnitPrice: String(json.config.tokenUnitPrice),
      vatRate: String(json.config.vatRate)
    });
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function save() {
    const res = await adminFetch("/api/admin/monetization", {
      method: "PATCH",
      body: JSON.stringify({
        monthlySubscriptionPrice: Number(form.monthlySubscriptionPrice),
        yearlySubscriptionPrice: Number(form.yearlySubscriptionPrice),
        featuredListingPrice: Number(form.featuredListingPrice),
        tokenUnitPrice: Number(form.tokenUnitPrice),
        vatRate: Number(form.vatRate)
      })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(json.message ?? "Failed to save monetization config");
      return;
    }
    setMessage("Monetization configuration updated.");
    await load();
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Monetization</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure pricing inputs and review monetization performance.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        {loading || !data ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            Loading monetization data...
          </div>
        ) : (
          <>
            <section className="mb-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              <Stat label="Completed revenue" value={data.stats.completedRevenue} />
              <Stat label="Completed payments" value={data.stats.completedPayments} />
              <Stat label="Refunded revenue" value={data.stats.refundedRevenue} />
              <Stat label="Refunded payments" value={data.stats.refundedPayments} />
              <Stat label="Users" value={data.stats.totalUsers} />
              <Stat label="Active contracts" value={data.stats.activeContracts} />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Pricing configuration</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {(
                  [
                    ["monthlySubscriptionPrice", "Monthly subscription"],
                    ["yearlySubscriptionPrice", "Yearly subscription"],
                    ["featuredListingPrice", "Featured listing"],
                    ["tokenUnitPrice", "Token unit"],
                    ["vatRate", "VAT rate"]
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block space-y-1 text-sm">
                    <span className="font-medium text-slate-700">{label}</span>
                    <input
                      type="number"
                      value={form[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void save()}
                className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
              >
                Save configuration
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
