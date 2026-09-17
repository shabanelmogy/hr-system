import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | ERP System",
  description: "ERP System page for Reset Password."
};

import { ResetPasswordPage as PageComponent } from "@/platform/auth/route-pages";

export default function Page() {
  return <PageComponent />;
}
