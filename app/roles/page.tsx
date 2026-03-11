"use client";

import { AdminSidebar } from "@/components/AdminSidebar";
import { adminFetch } from "@/lib/adminApi";
import { useEffect, useMemo, useState } from "react";

interface PermissionItem {
  id: string;
  code: string;
  description: string | null;
}

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  permissions: PermissionItem[];
  _count: {
    operators: number;
  };
}

export default function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [roleForm, setRoleForm] = useState({ name: "", description: "", permissionIds: [] as string[] });
  const [newRole, setNewRole] = useState({ name: "", description: "" });
  const [newPermission, setNewPermission] = useState({ code: "", description: "" });

  async function load() {
    const [rolesRes, permissionsRes] = await Promise.all([
      adminFetch("/api/admin/roles"),
      adminFetch("/api/admin/permissions")
    ]);

    const rolesData = await rolesRes.json().catch(() => ({}));
    const permissionsData = await permissionsRes.json().catch(() => ({}));

    if (rolesRes.ok) {
      setRoles(rolesData.items ?? []);
    } else {
      setMessage(rolesData.message ?? "Failed to load roles");
    }

    if (permissionsRes.ok) {
      setPermissions(permissionsData.items ?? []);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedRole = useMemo(
    () => roles.find(role => role.id === selectedId) ?? null,
    [roles, selectedId]
  );

  useEffect(() => {
    if (!selectedRole) return;
    setRoleForm({
      name: selectedRole.name,
      description: selectedRole.description ?? "",
      permissionIds: selectedRole.permissions.map(permission => permission.id)
    });
  }, [selectedRole]);

  function togglePermission(permissionId: string) {
    setRoleForm(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }));
  }

  async function createRole() {
    const res = await adminFetch("/api/admin/roles", {
      method: "POST",
      body: JSON.stringify(newRole)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to create role");
      return;
    }
    setNewRole({ name: "", description: "" });
    setMessage("Role created successfully.");
    await load();
  }

  async function saveRole() {
    if (!selectedRole) return;

    const updateRes = await adminFetch(`/api/admin/roles/${selectedRole.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: roleForm.name,
        description: roleForm.description
      })
    });
    const updateData = await updateRes.json().catch(() => ({}));
    if (!updateRes.ok) {
      setMessage(updateData.message ?? "Failed to update role");
      return;
    }

    const permissionsRes = await adminFetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
      method: "PATCH",
      body: JSON.stringify({ permissionIds: roleForm.permissionIds })
    });
    const permissionsData = await permissionsRes.json().catch(() => ({}));
    if (!permissionsRes.ok) {
      setMessage(permissionsData.message ?? "Failed to update role permissions");
      return;
    }

    setMessage("Role updated successfully.");
    await load();
  }

  async function deleteRole(id: string) {
    const confirmed = window.confirm("Delete this role?");
    if (!confirmed) return;

    const res = await adminFetch(`/api/admin/roles/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to delete role");
      return;
    }

    if (selectedId === id) {
      setSelectedId(null);
    }
    setMessage("Role deleted successfully.");
    await load();
  }

  async function createPermission() {
    const res = await adminFetch("/api/admin/permissions", {
      method: "POST",
      body: JSON.stringify(newPermission)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to create permission");
      return;
    }
    setNewPermission({ code: "", description: "" });
    setMessage("Permission created successfully.");
    await load();
  }

  async function deletePermission(id: string) {
    const confirmed = window.confirm("Delete this permission?");
    if (!confirmed) return;

    const res = await adminFetch(`/api/admin/permissions/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message ?? "Failed to delete permission");
      return;
    }
    setMessage("Permission deleted successfully.");
    await load();
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <main className="ml-64 flex-1 px-8 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; permissions</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create roles, manage permission sets and control operator access.
          </p>
        </header>

        {message && (
          <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {message}
          </div>
        )}

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Create role</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr,1.4fr,auto]">
            <input
              placeholder="Role name"
              value={newRole.name}
              onChange={e => setNewRole(prev => ({ ...prev, name: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Description"
              value={newRole.description}
              onChange={e => setNewRole(prev => ({ ...prev, description: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void createRole()}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Create role
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium">Roles</div>
            {roles.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">No roles found.</div>
            ) : (
              <div className="divide-y divide-slate-200">
                {roles.map(role => (
                  <div key={role.id} className={`px-4 py-4 ${selectedId === role.id ? "bg-blue-50" : ""}`}>
                    <div className="flex items-center justify-between gap-3">
                      <button type="button" onClick={() => setSelectedId(role.id)} className="text-left">
                        <h2 className="font-medium">{role.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">{role.description || "No description"}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteRole(role.id)}
                        className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {role.permissions.length} permissions · {role._count.operators} operators
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">Edit role</h2>
            {!selectedRole ? (
              <p className="mt-4 text-sm text-slate-500">Select a role to edit it.</p>
            ) : (
              <div className="mt-4 space-y-4">
                <input
                  value={roleForm.name}
                  onChange={e => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Role name"
                />
                <textarea
                  rows={3}
                  value={roleForm.description}
                  onChange={e => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Role description"
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Permissions</p>
                  <div className="max-h-72 space-y-2 overflow-auto rounded border border-slate-200 p-3">
                    {permissions.map(permission => (
                      <label key={permission.id} className="flex items-start gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={roleForm.permissionIds.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="mt-1"
                        />
                        <span>
                          <span className="font-medium text-slate-800">{permission.code}</span>
                          {permission.description && (
                            <span className="block text-xs text-slate-500">{permission.description}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void saveRole()}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                >
                  Save role
                </button>
              </div>
            )}
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Permissions</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr,1.5fr,auto]">
            <input
              placeholder="Permission code"
              value={newPermission.code}
              onChange={e => setNewPermission(prev => ({ ...prev, code: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Description"
              value={newPermission.description}
              onChange={e => setNewPermission(prev => ({ ...prev, description: e.target.value }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void createPermission()}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Create permission
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map(permission => (
                  <tr key={permission.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 font-medium">{permission.code}</td>
                    <td className="px-4 py-3">{permission.description || "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void deletePermission(permission.id)}
                        className="rounded border border-red-200 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
