import { redirect } from "next/navigation";

/** Root URL would otherwise 404 — there is no public landing page. */
export default function AdminRootPage() {
  redirect("/login");
}
