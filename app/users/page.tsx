"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

interface AdminUser {
  id: string;
  email: string;
  phone: string | null;
  userType: string | null;
  companyName: string | null;
  isVerified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState("");
  const [verified, setVerified] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (userType) params.set("userType", userType);
      if (verified) params.set("isVerified", verified);

      const res = await adminFetch(`/api/admin/users${params.toString() ? `?${params.toString()}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
      setLoading(false);
    }

    void load();
  }, [userType, verified]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse and inspect customer accounts across the platform.
          </p>
        </header>
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <select
              value={userType}
              onChange={e => setUserType(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1"
            >
              <option value="">All user types</option>
              <option value="CONTRACTOR">Contractor</option>
              <option value="SUBCONTRACTOR">Sub-contractor</option>
              <option value="TEAM">Team</option>
            </select>
            <select
              value={verified}
              onChange={e => setVerified(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1"
            >
              <option value="">All verification states</option>
              <option value="true">Verified</option>
              <option value="false">Not verified</option>
            </select>
          </div>
          {loading ? (
            <div className="px-4 py-6 text-sm text-slate-500">Loading users...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Verified</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-t border-slate-200">
                      <td className="px-4 py-3">{item.companyName || "-"}</td>
                      <td className="px-4 py-3">{item.email}</td>
                      <td className="px-4 py-3">{item.userType || "-"}</td>
                      <td className="px-4 py-3">{item.isVerified ? "Yes" : "No"}</td>
                      <td className="px-4 py-3">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/users/${item.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          View
                        </Link>
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

