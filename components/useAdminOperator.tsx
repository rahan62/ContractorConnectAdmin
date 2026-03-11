"use client";

import { useEffect, useState } from "react";

interface AdminOperator {
  id: string | null;
  name: string | null;
  email: string | null;
  token: string | null;
  ready: boolean;
}

export function useAdminOperator(): AdminOperator {
  const [state, setState] = useState<AdminOperator>({
    id: null,
    name: null,
    email: null,
    token: null,
    ready: false
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.localStorage.getItem("admin_operator_id");
    const token = window.localStorage.getItem("admin_access_token");
    const name = window.localStorage.getItem("admin_operator_name");
    const email = window.localStorage.getItem("admin_operator_email");
    setState({ id, name, email, token, ready: true });
  }, []);

  return state;
}

