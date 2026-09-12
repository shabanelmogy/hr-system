import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | ERP System",
  description: "ERP System page for Reset Password."
};

import PageComponent from "@/platform/auth/ResetPassword";

export default function Page() {
  return <PageComponent />;
}