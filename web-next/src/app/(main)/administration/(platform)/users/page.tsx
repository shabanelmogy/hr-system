import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration Users | ERP System",
  description: "Manage system users and account access."
};

import { UsersPage as PageComponent } from "@/platform/auth/users/route";

export default function Page() {
  return <PageComponent />;
}
