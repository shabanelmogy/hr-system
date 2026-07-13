import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration Roles | HR Management System",
  description: "Manage roles and authorization settings."
};

import PageComponent from "@/features/auth/roles/RolesPage";

export default function Page() {
  return <PageComponent />;
}
