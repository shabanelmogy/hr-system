import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | HR Management System",
  description: "HR Management System page for Reset Password."
};

import PageComponent from "@/features/auth/ResetPassword";

export default function Page() {
  return <PageComponent />;
}