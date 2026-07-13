import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration Users | HR Management System",
  description: "Manage system users and account access."
};

import PageComponent from "@/features/auth/users/UsersPage";

export default function Page() {
  return <PageComponent />;
}
