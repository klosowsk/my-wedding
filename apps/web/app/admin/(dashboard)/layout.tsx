import { redirect } from "next/navigation";
import { requireAdmin } from "@/src/auth/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { QueryProvider } from "@/lib/query-provider";
import { ToastProvider } from "@/components/ui/Toast";
import type { ReactNode } from "react";

export const metadata = {
  title: "Admin | Wedding",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/signin");
  }

  return (
    <QueryProvider>
      <ToastProvider>
        <AdminShell>{children}</AdminShell>
      </ToastProvider>
    </QueryProvider>
  );
}
