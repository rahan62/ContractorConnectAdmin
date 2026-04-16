"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useState } from "react";

interface CategoryExperienceItem {
  id: string;
  documentUrls: string;
  applicantNote: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    companyName: string | null;
    userType: string | null;
  } | null;
  mainCategory: {
    id: string;
    slug: string;
    nameEn: string;
    nameTr: string;
  };
  reviewedByOperator: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  declaredEvidenceValueUsd?: string | number | null;
}

export default function CategoryExperienceAdminPage() {
  const [items, setItems] = useState<CategoryExperienceItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [evidenceUsd, setEvidenceUsd] = useState<Record<string, string>>({});
  const [actingId, setActingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const query = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
    const res = await adminFetch(`/api/admin/category-experience-requests${query}`);
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setItems(data.items ?? []);
      setMessage(null);
    } else {
      setMessage((data as { message?: string }).message ?? "Failed to load requests");
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [statusFilter]);

  async function review(id: string, nextStatus: "APPROVED" | "REJECTED") {
    setActingId(id);
    setMessage(null);
    const reviewerNote = notes[id]?.trim() || undefined;

    const body: {
      status: string;
      reviewerNote?: string;
      declaredEvidenceValueUsd?: number | null;
    } = { status: nextStatus, reviewerNote };

    if (nextStatus === "APPROVED") {
      const raw = evidenceUsd[id]?.trim();
      if (raw) {
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 0) {
          setActingId(null);
          setMessage("Declared evidence (USD) must be a non-negative number.");
          return;
        }
        body.declaredEvidenceValueUsd = n;
      }
    }

    const res = await adminFetch(`/api/admin/category-experience-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    setActingId(null);
    if (!res.ok) {
      setMessage((data as { message?: string }).message ?? "Failed to update request");
      return;
    }
    setItems(prev => prev.map(item => (item.id === id ? { ...item, ...(data as CategoryExperienceItem) } : item)));
    setMessage("Request updated.");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Category experience approval requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review uploaded invoices and evidence. Approving adds the main trade category to the user&apos;s profile.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <span className="font-medium">Queue</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          {loading ? (
            <div className="px-4 py-6 text-sm text-slate-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">No requests found.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {items.map(item => (
                <div key={item.id} className="px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium">
                        {item.mainCategory.nameEn}
                        <span className="ml-2 text-sm font-normal text-slate-500">({item.mainCategory.slug})</span>
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Company: {item.user?.companyName || "—"} · {item.user?.email || "—"} ·{" "}
                        {item.user?.userType || "—"}
                      </p>
                      {item.applicantNote && (
                        <p className="mt-2 text-sm text-slate-600">
                          <span className="font-medium">Applicant note:</span> {item.applicantNote}
                        </p>
                      )}
                      <div className="mt-2 space-y-1 text-xs">
                        <span className="font-medium text-slate-700">Evidence:</span>
                        {item.documentUrls
                          .split(";")
                          .map(s => s.trim())
                          .filter(Boolean)
                          .map(url => (
                            <div key={url}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {url.split("/").pop() || url}
                              </a>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          item.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : item.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.reviewedAt && (
                        <p className="mt-2 text-xs text-slate-500">
                          Reviewed {new Date(item.reviewedAt).toLocaleString()}
                          {item.reviewedByOperator?.name || item.reviewedByOperator?.email
                            ? ` · ${item.reviewedByOperator?.name || item.reviewedByOperator?.email}`
                            : ""}
                        </p>
                      )}
                      {item.reviewerNote && (
                        <p className="mt-1 text-xs text-slate-600">Note: {item.reviewerNote}</p>
                      )}
                    </div>
                  </div>

                  {item.status === "PENDING" && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600">Reviewer note (optional)</label>
                          <textarea
                            className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                            rows={2}
                            value={notes[item.id] ?? ""}
                            onChange={e =>
                              setNotes(prev => ({
                                ...prev,
                                [item.id]: e.target.value
                              }))
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600">
                            Declared job / evidence value (USD, optional — used for strength score)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="e.g. 1000000"
                            className="mt-1 w-full max-w-xs rounded border border-slate-300 px-2 py-1.5 text-sm"
                            value={evidenceUsd[item.id] ?? ""}
                            onChange={e =>
                              setEvidenceUsd(prev => ({
                                ...prev,
                                [item.id]: e.target.value
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                          disabled={actingId === item.id}
                          onClick={() => void review(item.id, "APPROVED")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          disabled={actingId === item.id}
                          onClick={() => void review(item.id, "REJECTED")}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
