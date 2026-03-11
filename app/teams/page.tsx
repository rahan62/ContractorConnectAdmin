"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useState } from "react";

interface TeamItem {
  id: string;
  name: string;
  createdAt: string;
  leader: {
    id: string;
    name: string | null;
    email: string;
    companyName: string | null;
  };
  _count: {
    members: number;
  };
}

export default function TeamsPage() {
  const [items, setItems] = useState<TeamItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await adminFetch("/api/admin/teams");
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setItems(data.items ?? []);
      } else {
        setMessage(data.message ?? "Failed to load teams");
      }
      setLoading(false);
    }

    void load();
  }, []);

  async function saveTeam(id: string) {
    const res = await adminFetch(`/api/admin/teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to update team");
      return;
    }
    setItems(prev => prev.map(item => (item.id === id ? { ...item, name: data.name } : item)));
    setEditingId(null);
    setMessage("Team updated successfully.");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Teams</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review registered teams and update basic team information.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium">Teams</div>
          {loading ? (
            <div className="px-4 py-6 text-sm text-slate-500">Loading teams...</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">No teams found.</div>
          ) : (
            <div className="divide-y divide-slate-200">
              {items.map(item => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
                  <div>
                    {editingId === item.id ? (
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="rounded border border-slate-300 px-3 py-2 text-sm"
                      />
                    ) : (
                      <h2 className="font-medium">{item.name}</h2>
                    )}
                    <p className="mt-1 text-sm text-slate-500">
                      Leader: {item.leader.companyName || item.leader.name || item.leader.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item._count.members} members · Created {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => void saveTeam(item.id)}
                        className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded border border-slate-300 px-3 py-2 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setName(item.name);
                      }}
                      className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      Edit
                    </button>
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
