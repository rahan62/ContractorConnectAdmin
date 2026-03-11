"use client";

import { useEffect, useState } from "react";

interface AdminOperator {
  id: string | null;
  name: string | null;
  email: string | null;
  ready: boolean;
}

export function useAdminOperator(): AdminOperator {
  const [state, setState] = useState<AdminOperator>({
    id: null,
    name: null,
    email: null,
    ready: false
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.localStorage.getItem("admin_operator_id");
    const name = window.localStorage.getItem("admin_operator_name");
    const email = window.localStorage.getItem("admin_operator_email");
    setState({ id, name, email, ready: true });
  }, []);

  return state;
}

