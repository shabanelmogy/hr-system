import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forget Password | HR Management System",
  description: "HR Management System page for Forget Password."
};

import PageComponent from "@/features/auth/ForgetPassword";

export default function Page() {
  return <PageComponent />;
}