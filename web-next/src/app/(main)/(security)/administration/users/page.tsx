import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration Users | ERP System",
  description: "Manage system users and account access."
};

import PageComponent from "@/platform/auth/users/UsersPage";

export default function Page() {
  return <PageComponent />;
}
