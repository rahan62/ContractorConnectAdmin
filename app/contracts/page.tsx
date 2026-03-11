"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useMemo, useState } from "react";

interface ContractItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  currency: string | null;
  startsAt: string | null;
  totalDays: number | null;
  createdAt: string;
  contractor: { id: string; companyName: string | null; email: string } | null;
  client: { id: string; companyName: string | null; email: string } | null;
  _count: { bids: number; comments: number; complaints: number };
}

export default function ContractsPage() {
  const [items, setItems] = useState<ContractItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "DRAFT",
    budget: "",
    currency: "",
    startsAt: "",
    totalDays: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const query = statusFilter ? `?status=${statusFilter}` : "";
    const res = await adminFetch(`/api/admin/contracts${query}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setItems(data.items ?? []);
    } else {
      setMessage(data.message ?? "Failed to load contracts");
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  const selected = useMemo(
    () => items.find(item => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setForm({
      title: selected.title,
      description: selected.description ?? "",
      status: selected.status,
      budget: selected.budget ? String(selected.budget) : "",
      currency: selected.currency ?? "",
      startsAt: selected.startsAt ? selected.startsAt.slice(0, 10) : "",
      totalDays: selected.totalDays ? String(selected.totalDays) : ""
    });
  }, [selected]);

  async function saveSelected() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);

    const res = await adminFetch(`/api/admin/contracts/${selected.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        status: form.status,
        budget: form.budget ? Number(form.budget) : null,
        currency: form.currency || null,
        startsAt: form.startsAt || null,
        totalDays: form.totalDays ? Number(form.totalDays) : null
      })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to update contract");
      setSaving(false);
      return;
    }

    setItems(prev => prev.map(item => (item.id === selected.id ? { ...item, ...data } : item)));
    setMessage("Contract updated successfully.");
    setSaving(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Inspect contracts, review bid activity and edit requested fields.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium">Contracts list</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
              >
                <option value="">All statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="OPEN_FOR_BIDS">Open for bids</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            {loading ? (
              <div className="px-4 py-6 text-sm text-slate-500">Loading contracts...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">No contracts found.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {items.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`block w-full px-4 py-4 text-left hover:bg-slate-50 ${
                      selectedId === item.id ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-medium">{item.title}</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.contractor?.companyName || item.contractor?.email || "Unknown contractor"}
                        </p>
                      </div>
                      <span className="rounded-full border px-2 py-1 text-xs text-slate-600">
                        {item.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                      <span>{item._count.bids} bids</span>
                      <span>{item._count.comments} comments</span>
                      <span>{item._count.complaints} complaints</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Edit contract</h2>
            {!selected ? (
              <p className="mt-4 text-sm text-slate-500">Select a contract to inspect and edit it.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Title">
                    <input
                      value={form.title}
                      onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="OPEN_FOR_BIDS">Open for bids</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </Field>
                  <Field label="Budget">
                    <input
                      type="number"
                      value={form.budget}
                      onChange={e => setForm(prev => ({ ...prev, budget: e.target.value }))}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="Currency">
                    <input
                      value={form.currency}
                      onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="Start date">
                    <input
                      type="date"
                      value={form.startsAt}
                      onChange={e => setForm(prev => ({ ...prev, startsAt: e.target.value }))}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </Field>
                  <Field label="Total days">
                    <input
                      type="number"
                      value={form.totalDays}
                      onChange={e => setForm(prev => ({ ...prev, totalDays: e.target.value }))}
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea
                    rows={6}
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  />
                </Field>
                <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                  <p>Contractor: {selected.contractor?.companyName || selected.contractor?.email || "-"}</p>
                  <p>Client: {selected.client?.companyName || selected.client?.email || "-"}</p>
                  <p>Created: {new Date(selected.createdAt).toLocaleString()}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void saveSelected()}
                  disabled={saving}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
