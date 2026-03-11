## ContractorConnectAdmin – Admin Panel

Reconstructed admin/operator panel for ContractorConnect, based on the supplied architecture docs.

- **Stack**: Next.js App Router, TypeScript, Tailwind CSS, `lucide-react`.
- **Intended features**: Sidebar navigation (`AdminSidebar`), admin login with Turnstile, dashboard, users/contracts/complaints/payments/teams/operators/roles/registrations/monetization pages that consume the Admin API.
- **Next steps**:
  - Add Tailwind setup and a global `app/layout.tsx` with favicon and basic layout.
  - Implement `components/AdminSidebar.tsx` and stub pages under `app/*` according to the markdown description.
  - Point API calls at `NEXT_PUBLIC_ADMIN_API_URL` (the Express Admin API project).

