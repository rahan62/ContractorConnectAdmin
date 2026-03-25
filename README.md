## ContractorConnectAdmin – Admin Panel

Reconstructed admin/operator panel for ContractorConnect, based on the supplied architecture docs.

- **Stack**: Next.js App Router, TypeScript, Tailwind CSS, `lucide-react`.
- **Intended features**: Sidebar navigation (`AdminSidebar`), admin login with Turnstile, dashboard, users/contracts/complaints/payments/teams/operators/roles/registrations/monetization pages that consume the Admin API.
- **Next steps**:
  - Add Tailwind setup and a global `app/layout.tsx` with favicon and basic layout.
  - Implement `components/AdminSidebar.tsx` and stub pages under `app/*` according to the markdown description.
  - Point API calls at `NEXT_PUBLIC_ADMIN_API_URL` (the Express Admin API project).

### Production: `ERR_CERT_COMMON_NAME_INVALID` on login

The admin UI calls `NEXT_PUBLIC_ADMIN_API_URL` from the browser. If you use `https://api.taseron.org` (or any host), **the TLS certificate served on that host must include that name** in the Subject Alternative Name (SAN). If the server presents a certificate for another domain (e.g. only `taseron.org`, or a hosting default), the browser blocks the request with `ERR_CERT_COMMON_NAME_INVALID`.

**Fix (infrastructure):**

1. **Issue a cert for the API host** — e.g. Let’s Encrypt for `api.taseron.org` on the machine or load balancer that terminates HTTPS, or use your host’s managed SSL for that subdomain.
2. **Align DNS and TLS** — Ensure `api.taseron.org` resolves to the endpoint that serves the correct certificate (not an old IP with the wrong vhost).
3. **Alternative** — Serve the Admin API under a path on a host that already has a valid cert (e.g. `https://taseron.org/admin-api` via reverse proxy) and set `NEXT_PUBLIC_ADMIN_API_URL` to that base URL (no trailing slash). The Express app must be mounted or proxied accordingly.

After changing DNS or certs, redeploy the admin frontend if you change `NEXT_PUBLIC_ADMIN_API_URL`.

