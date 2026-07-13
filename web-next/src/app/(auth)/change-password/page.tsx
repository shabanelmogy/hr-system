import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password | HR Management System",
  description: "HR Management System page for Change Password."
};

import PageComponent from "@/features/auth/profile/profile-tabs/change-password/ChangePassword";

export default function Page() {
  return <PageComponent />;
}
