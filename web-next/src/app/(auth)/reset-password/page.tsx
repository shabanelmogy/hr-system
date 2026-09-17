import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | ERP System",
  description: "ERP System page for Reset Password."
};

import { ResetPasswordPage as PageComponent } from "@/platform/auth/reset-password";

export default function Page() {
  return <PageComponent />;
}
