"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

interface RegistrationUser {
  id: string;
  email: string;
  userType: string | null;
  companyName: string | null;
  companyTaxOffice: string | null;
  companyTaxNumber: string | null;
  authorizedPersonName: string | null;
  authorizedPersonPhone: string | null;
  signatureAuthDocUrl: string | null;
  taxCertificateDocUrl: string | null;
  tradeRegistryGazetteDocUrl: string | null;
  isVerified: boolean;
}

export default function RegistrationsPage() {
  const [items, setItems] = useState<RegistrationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);

    const res = await adminFetch("/api/admin/registrations");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setItems([]);
      setError(data.message ?? "Failed to load registrations");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function approveUser(id: string) {
    setMessage(null);
    setError(null);

    const res = await adminFetch(`/api/admin/users/${id}/verify`, {
      method: "PATCH"
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message ?? "Failed to approve user");
      return;
    }

    setMessage("Company approved successfully.");
    await load();
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Manual registrations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review newly registered users, preview their documents and approve valid companies.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              Loading pending applications...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
              No registrations waiting for approval.
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{item.companyName || item.email}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.userType} · {item.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/users/${item.id}`}
                      className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Open profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => approveUser(item.id)}
                      className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
                    >
                      Approve
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <p><span className="font-medium">Tax office:</span> {item.companyTaxOffice || "-"}</p>
                  <p><span className="font-medium">Tax number:</span> {item.companyTaxNumber || "-"}</p>
                  <p><span className="font-medium">Authorized name:</span> {item.authorizedPersonName || "-"}</p>
                  <p><span className="font-medium">Authorized phone:</span> {item.authorizedPersonPhone || "-"}</p>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <DocCard label="Signature authorization" href={item.signatureAuthDocUrl} />
                  <DocCard label="Tax certificate" href={item.taxCertificateDocUrl} />
                  <DocCard label="Trade registry gazette" href={item.tradeRegistryGazetteDocUrl} />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

function DocCard({ label, href }: { label: string; href: string | null }) {
  return (
    <div className="rounded border border-slate-200 p-3">
      <p className="font-medium">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-blue-600 hover:underline"
        >
          Preview document
        </a>
      ) : (
        <p className="mt-2 text-slate-500">Missing document</p>
      )}
    </div>
  );
}
