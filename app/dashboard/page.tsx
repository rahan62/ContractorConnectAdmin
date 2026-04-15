"use client";

import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";
import { useAdminOperator } from "@/components/useAdminOperator";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useState } from "react";

interface DashboardStats {
  users: number;
  pendingRegistrations: number;
  openComplaints: number;
  contracts: number;
  revenue: number;
}

export default function DashboardPage() {
  const operator = useAdminOperator();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await adminFetch("/api/admin/dashboard");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? "Failed to load dashboard");
        return;
      }
      setStats(await res.json());
    }

    void load();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">
              {operator.name ? `Welcome back, ${operator.name}.` : "Welcome to the Taseron admin panel."}
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-5">
          <StatCard label="Users" value={stats?.users} />
          <StatCard label="Pending registrations" value={stats?.pendingRegistrations} />
          <StatCard label="Open complaints" value={stats?.openComplaints} />
          <StatCard label="Contracts" value={stats?.contracts} />
          <StatCard label="Revenue" value={stats ? `${stats.revenue}` : undefined} />
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-slate-700">Queues</h2>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900">Category experience approvals</p>
                <p className="mt-1 text-sm text-slate-500">
                  Review trade-category evidence and approve or reject company requests.
                </p>
              </div>
              <Link
                href="/category-experience"
                className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Open queue
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value ?? "—"}</p>
    </div>
  );
}
