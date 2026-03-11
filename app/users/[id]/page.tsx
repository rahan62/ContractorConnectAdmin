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
  isVerified: boolean;
  createdAt: string;
}

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
              </div>
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

