import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { uiText } from "@/content/uiText";
import { requireAdminPage } from "@/lib/admin-auth";

export const metadata = {
  title: uiText.admin.metadataTitle
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const session = requireAdminPage();

  return <AdminShell username={session.username}>{children}</AdminShell>;
}
