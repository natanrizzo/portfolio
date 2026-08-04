import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/admin-nav";
import { requireUser } from "@/lib/auth/current-user";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // Authoritative gate. The middleware only checks the token signature.
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <AdminNav userName={user.name} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-6 md:py-14">
        {children}
      </main>
    </div>
  );
}
