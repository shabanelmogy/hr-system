import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forget Password | ERP System",
  description: "ERP System page for Forget Password."
};

import { ForgetPasswordPage as PageComponent } from "@/platform/auth/route-pages";

export default function Page() {
  return <PageComponent />;
}
