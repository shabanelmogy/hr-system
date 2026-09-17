import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password | ERP System",
  description: "ERP System page for Change Password."
};

import { ChangePasswordPage as PageComponent } from "@/platform/auth/route-pages";

export default function Page() {
  return <PageComponent />;
}
