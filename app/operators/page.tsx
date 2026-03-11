"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useMemo, useState } from "react";

interface RoleOption {
  id: string;
  name: string;
}

interface OperatorItem {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  roles: RoleOption[];
}

export default function OperatorsPage() {
  const [items, setItems] = useState<OperatorItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", isActive: true, roleIds: [] as string[] });
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "", roleIds: [] as string[] });

  async function load() {
    setLoading(true);
    const [operatorsRes, rolesRes] = await Promise.all([
      adminFetch("/api/admin/operators"),
      adminFetch("/api/admin/roles")
    ]);

    const operatorsData = await operatorsRes.json().catch(() => ({}));
    const rolesData = await rolesRes.json().catch(() => ({}));

    if (operatorsRes.ok) {
      setItems(operatorsData.items ?? []);
    } else {
      setMessage(operatorsData.message ?? "Failed to load operators");
    }

    if (rolesRes.ok) {
      setRoles((rolesData.items ?? []).map((item: any) => ({ id: item.id, name: item.name })));
    }

    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const selected = useMemo(
    () => items.find(item => item.id === selectedId) ?? null,
    [items, selectedId]
  );

  useEffect(() => {
    if (!selected) return;
    setForm({
      name: selected.name ?? "",
      email: selected.email,
      password: "",
      isActive: selected.isActive,
      roleIds: selected.roles.map(role => role.id)
    });
  }, [selected]);

  function toggleRole(list: string[], roleId: string) {
    return list.includes(roleId) ? list.filter(id => id !== roleId) : [...list, roleId];
  }

  async function createOperator() {
    const res = await adminFetch("/api/admin/operators", {
      method: "POST",
      body: JSON.stringify(createForm)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to create operator");
      return;
    }
    setCreateForm({ name: "", email: "", password: "", roleIds: [] });
    setMessage("Operator created successfully.");
    await load();
  }

  async function saveOperator() {
    if (!selected) return;

    const updateRes = await adminFetch(`/api/admin/operators/${selected.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        isActive: form.isActive
      })
    });
    const updateData = await updateRes.json().catch(() => ({}));
    if (!updateRes.ok) {
      setMessage(updateData.message ?? "Failed to update operator");
      return;
    }

    const roleRes = await adminFetch(`/api/admin/operators/${selected.id}/roles`, {
      method: "PATCH",
      body: JSON.stringify({ roleIds: form.roleIds })
    });
    const roleData = await roleRes.json().catch(() => ({}));
    if (!roleRes.ok) {
      setMessage(roleData.message ?? "Failed to assign roles");
      return;
    }

    setMessage("Operator updated successfully.");
    await load();
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Operators</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create admin operators, assign roles and manage access.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Add operator</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              placeholder="Name"
              value={createForm.name}
              onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Email"
              value={createForm.email}
              onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Password"
              type="password"
              value={createForm.password}
              onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void createOperator()}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Create operator
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {roles.map(role => (
              <label key={role.id} className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={createForm.roleIds.includes(role.id)}
                  onChange={() =>
                    setCreateForm(prev => ({ ...prev, roleIds: toggleRole(prev.roleIds, role.id) }))
                  }
                />
                {role.name}
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium">
              Operators
            </div>
            {loading ? (
              <div className="px-4 py-6 text-sm text-slate-500">Loading operators...</div>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">No operators found.</div>
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
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="font-medium">{item.name || item.email}</h2>
                        <p className="mt-1 text-sm text-slate-500">{item.email}</p>
                      </div>
                      <span className="rounded-full border px-2 py-1 text-xs text-slate-600">
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Roles: {item.roles.map(role => role.name).join(", ") || "No roles"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Edit operator</h2>
            {!selected ? (
              <p className="mt-4 text-sm text-slate-500">Select an operator to edit their access.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Name"
                />
                <input
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Email"
                />
                <input
                  value={form.password}
                  onChange={e => setForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="New password (optional)"
                  type="password"
                />
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active operator
                </label>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Roles</p>
                  <div className="flex flex-wrap gap-3">
                    {roles.map(role => (
                      <label key={role.id} className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={form.roleIds.includes(role.id)}
                          onChange={() =>
                            setForm(prev => ({ ...prev, roleIds: toggleRole(prev.roleIds, role.id) }))
                          }
                        />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void saveOperator()}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Save operator
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
