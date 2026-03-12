import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Taseron Admin",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const turnstileEnabled = process.env.NEXT_PUBLIC_ADMIN_TURNSTILE_ENABLED !== "false";

  return (
    <html lang="en">
      <head>
        {turnstileEnabled && turnstileSiteKey && (
          <script
            suppressHydrationWarning
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            async
            defer
          />
        )}
      </head>
      <body className="min-h-screen bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}


