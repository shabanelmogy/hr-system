import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password | ERP System",
  description: "ERP System page for Change Password."
};

import PageComponent from "@/platform/auth/profile/profile-tabs/change-password/ChangePassword";

export default function Page() {
  return <PageComponent />;
}
