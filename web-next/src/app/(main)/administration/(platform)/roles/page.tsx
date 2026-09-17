import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration Roles | ERP System",
  description: "Manage roles and authorization settings."
};

import { RolesPage as PageComponent } from "@/platform/auth/route-pages";

export default function Page() {
  return <PageComponent />;
}
