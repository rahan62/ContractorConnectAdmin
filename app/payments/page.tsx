"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useMemo, useState } from "react";

interface PaymentItem {
  id: string;
  amount: number;
  currency: string | null;
  status: string;
  createdAt: string;
  user: { id: string; companyName: string | null; email: string } | null;
  contract: { id: string; title: string } | null;
}

interface PaymentTotal {
  status: string;
  _sum: { amount: number | null };
}

export default function PaymentsPage() {
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [totals, setTotals] = useState<PaymentTotal[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await adminFetch("/api/admin/payments");
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setItems(data.items ?? []);
        setTotals(data.totals ?? []);
      } else {
        setMessage(data.message ?? "Failed to load payments");
      }
      setLoading(false);
    }

    void load();
  }, []);

  const completedRevenue = useMemo(
    () => totals.find(item => item.status === "COMPLETED")?._sum.amount ?? 0,
    [totals]
  );

  async function refundPayment(id: string) {
    const res = await adminFetch(`/api/admin/payments/${id}/refund`, { method: "PATCH" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to refund payment");
      return;
    }
    setItems(prev => prev.map(item => (item.id === id ? { ...item, status: data.status } : item)));
    setMessage("Payment refunded successfully.");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track subscription payments and issue refunds when required.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Stat label="Payments" value={items.length} />
          <Stat label="Completed revenue" value={completedRevenue} />
          <Stat label="Refunded payments" value={items.filter(item => item.status === "REFUNDED").length} />
        </section>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium">
            Payment records
          </div>
          {loading ? (
            <div className="px-4 py-6 text-sm text-slate-500">Loading payments...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">No payments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Contract</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.user?.companyName || item.user?.email || "-"}</td>
                      <td className="px-4 py-3">{item.contract?.title || "-"}</td>
                      <td className="px-4 py-3">
                        {item.amount} {item.currency || ""}
                      </td>
                      <td className="px-4 py-3">{item.status}</td>
                      <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {item.status !== "REFUNDED" ? (
                          <button
                            type="button"
                            onClick={() => void refundPayment(item.id)}
                            className="rounded border border-slate-300 px-3 py-1 text-sm hover:bg-slate-50"
                          >
                            Refund
                          </button>
                        ) : (
                          <span className="text-slate-400">Refunded</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
