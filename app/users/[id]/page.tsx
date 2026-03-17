"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminUserDetail {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  userType: string | null;
  companyName: string | null;
  bio: string | null;
  companyTaxOffice: string | null;
  companyTaxNumber: string | null;
  authorizedPersonName: string | null;
  authorizedPersonPhone: string | null;
  signatureAuthDocUrl: string | null;
  taxCertificateDocUrl: string | null;
  tradeRegistryGazetteDocUrl: string | null;
  tokenBalance: number;
  isVerified: boolean;
  createdAt: string;
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenAmount, setTokenAmount] = useState("");
  const [tokenMessage, setTokenMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await adminFetch(`/api/admin/users/${params.id}`);
      if (res.ok) {
        setUser(await res.json());
      }
      setLoading(false);
    }

    if (params?.id) {
      void load();
    }
  }, [params?.id]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">User detail</h1>
        </header>
        {loading || !user ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            Loading user...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.3fr,0.9fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">{user.companyName || user.email}</h2>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Type:</span> {user.userType || "-"}</p>
                <p><span className="font-medium">Phone:</span> {user.phone || "-"}</p>
                <p><span className="font-medium">Verified:</span> {user.isVerified ? "Yes" : "No"}</p>
                <p><span className="font-medium">Tax office:</span> {user.companyTaxOffice || "-"}</p>
                <p><span className="font-medium">Tax number:</span> {user.companyTaxNumber || "-"}</p>
                <p><span className="font-medium">Authorized name:</span> {user.authorizedPersonName || "-"}</p>
                <p><span className="font-medium">Authorized phone:</span> {user.authorizedPersonPhone || "-"}</p>
                <p><span className="font-medium">Token balance:</span> {user.tokenBalance}</p>
              </div>
              <button
                type="button"
                className="mt-4 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                onClick={() => {
                  setTokenAmount("");
                  setTokenMessage(null);
                  setTokenModalOpen(true);
                }}
              >
                Add tokens
              </button>
              {tokenModalOpen && (
                <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
                  <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
                    <h3 className="text-lg font-semibold">Add tokens to user</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Tokens are currently free; in the future this will be connected to payments and batch packages.
                    </p>
                    <label className="mt-3 block space-y-1 text-sm">
                      <span className="font-medium text-slate-700">Amount</span>
                      <input
                        type="number"
                        min={1}
                        value={tokenAmount}
                        onChange={e => setTokenAmount(e.target.value)}
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    </label>
                    {tokenMessage && (
                      <p className="mt-2 text-xs text-slate-600">{tokenMessage}</p>
                    )}
                    <div className="mt-4 flex justify-end gap-2 text-sm">
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-3 py-1.5"
                        onClick={() => setTokenModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="rounded bg-blue-600 px-3 py-1.5 font-medium text-white"
                        onClick={async () => {
                          const amount = Number.parseInt(tokenAmount || "0", 10);
                          if (!amount || amount <= 0) {
                            setTokenMessage("Please enter a positive token amount.");
                            return;
                          }
                          const res = await adminFetch(`/api/admin/users/${params.id}/add-tokens`, {
                            method: "POST",
                            body: JSON.stringify({ amount })
                          });
                          const json = await res.json().catch(() => ({}));
                          if (!res.ok) {
                            setTokenMessage(json.message ?? "Failed to add tokens");
                            return;
                          }
                          setTokenMessage("Tokens added.");
                          setUser(prev => (prev ? { ...prev, tokenBalance: json.tokenBalance } : prev));
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Documents</h2>
              <div className="mt-4 space-y-3 text-sm">
                <DocumentLink label="Signature authorization" href={user.signatureAuthDocUrl} />
                <DocumentLink label="Tax certificate" href={user.taxCertificateDocUrl} />
                <DocumentLink label="Trade registry gazette" href={user.tradeRegistryGazetteDocUrl} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DocumentLink({ label, href }: { label: string; href: string | null }) {
  return (
    <div className="rounded border border-slate-200 p-3">
      <p className="font-medium">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="mt-1 inline-block text-blue-600 hover:underline">
          Preview document
        </a>
      ) : (
        <p className="mt-1 text-slate-500">No document uploaded.</p>
      )}
    </div>
  );
}

