"use client";

const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:4000";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("admin_access_token");
}

export function setAdminSession(data: {
  operatorId: string;
  accessToken: string;
  name?: string | null;
  email?: string | null;
}) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("admin_operator_id", data.operatorId);
  window.localStorage.setItem("admin_access_token", data.accessToken);
  if (data.name) {
    window.localStorage.setItem("admin_operator_name", data.name);
  } else {
    window.localStorage.removeItem("admin_operator_name");
  }
  if (data.email) {
    window.localStorage.setItem("admin_operator_email", data.email);
  } else {
    window.localStorage.removeItem("admin_operator_email");
  }
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("admin_operator_id");
  window.localStorage.removeItem("admin_access_token");
  window.localStorage.removeItem("admin_operator_name");
  window.localStorage.removeItem("admin_operator_email");
}

export async function adminFetch(path: string, init?: RequestInit) {
  const accessToken = getAccessToken();
  const headers = new Headers(init?.headers || {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${ADMIN_API_URL}${path}`, {
    ...init,
    headers
  });

  return res;
}

