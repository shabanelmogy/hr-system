import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Role Permissions | ERP System",
  description: "Manage permissions assigned to a system role."
};

import { RolePermissionsPage as PageComponent } from "@/platform/auth/route-pages";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PageComponent id={id} />;
}
