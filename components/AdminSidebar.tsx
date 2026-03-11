"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertCircle,
  CreditCard,
  Users2,
  Shield,
  UserPlus,
  BadgeDollarSign,
  LogOut
} from "lucide-react";
import { useAdminOperator } from "./useAdminOperator";
import { clearAdminSession } from "@/lib/adminApi";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/registrations", label: "Manual Registrations", icon: FileText },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/complaints", label: "Complaints", icon: AlertCircle },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/teams", label: "Teams", icon: Users2 },
  { href: "/operators", label: "Operators", icon: UserPlus },
  { href: "/roles", label: "Roles & Permissions", icon: Shield },
  { href: "/monetization", label: "Monetization", icon: BadgeDollarSign }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const operator = useAdminOperator();

  useEffect(() => {
    if (operator.ready && !operator.id) {
      router.replace("/login");
    }
  }, [operator.ready, operator.id, router]);

  function handleLogout() {
    clearAdminSession();
    window.location.href = "/login";
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-64 border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">
          T
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide">Taseron</span>
          <span className="text-xs text-slate-500">Admin Panel</span>
        </div>
      </div>
      <nav className="mt-4 space-y-1 px-2 text-sm">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 space-y-3 border-t border-slate-200 bg-slate-50 px-3 py-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            {(operator.name || operator.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">
              {operator.name || operator.email || "Operator"}
            </span>
            {operator.email && (
              <span className="text-[11px] text-slate-500">{operator.email}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}


