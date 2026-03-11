"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useState } from "react";

interface ComplaintItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  user: { id: string; companyName: string | null; email: string } | null;
  contract: { id: string; title: string; status: string } | null;
}

export default function ComplaintsPage() {
  const [items, setItems] = useState<ComplaintItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const query = statusFilter ? `?status=${statusFilter}` : "";
    const res = await adminFetch(`/api/admin/complaints${query}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setItems(data.items ?? []);
    } else {
      setMessage(data.message ?? "Failed to load complaints");
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  async function updateStatus(id: string, status: string) {
    const res = await adminFetch(`/api/admin/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to update complaint");
      return;
    }
    setItems(prev => prev.map(item => (item.id === id ? { ...item, status: data.status } : item)));
    setMessage("Complaint updated successfully.");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Complaints</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor active complaints and update their triage status.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="font-medium">Complaints queue</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1"
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          {loading ? (
            <div className="px-4 py-6 text-sm text-slate-500">Loading complaints...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">No complaints found.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {items.map(item => (
                <div key={item.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium">{item.title}</h2>
                      <p className="mt-1 text-sm text-slate-500">{item.description || "No description"}</p>
                    </div>
                    <select
                      value={item.status}
                      onChange={e => void updateStatus(item.id, e.target.value)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>User: {item.user?.companyName || item.user?.email || "-"}</span>
                    <span>Contract: {item.contract?.title || "-"}</span>
                    <span>Created: {new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
