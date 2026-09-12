import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration Roles | ERP System",
  description: "Manage roles and authorization settings."
};

import PageComponent from "@/platform/auth/roles/RolesPage";

export default function Page() {
  return <PageComponent />;
}
