"use client";

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
