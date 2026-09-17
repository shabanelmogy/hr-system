import type { Metadata } from "next";
import { Suspense } from "react";
import { RouteLoading } from "@/shared/components/feedback/routes";

export const metadata: Metadata = {
  title: "Role Permissions | ERP System",
  description: "Manage permissions assigned to a system role."
};

import { RolePermissionsPage as PageComponent } from "@/platform/auth/roles/permissions";

type RolePermissionsRouteProps = { params: Promise<{ id: string }> };

export default function Page({ params }: RolePermissionsRouteProps) {
  return (
    <Suspense fallback={<RouteLoading />}>
      <RolePermissionsRouteContent params={params} />
    </Suspense>
  );
}

async function RolePermissionsRouteContent({ params }: RolePermissionsRouteProps) {
  const { id } = await params;
  return <PageComponent id={id} />;
}
