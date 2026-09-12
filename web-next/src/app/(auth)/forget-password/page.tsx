import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forget Password | ERP System",
  description: "ERP System page for Forget Password."
};

import PageComponent from "@/platform/auth/ForgetPassword";

export default function Page() {
  return <PageComponent />;
}