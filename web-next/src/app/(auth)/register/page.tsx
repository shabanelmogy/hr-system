import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | HR Management System",
  description: "HR Management System page for Register."
};

import PageComponent from "@/features/auth/register/Register";

export default function Page() {
  return <PageComponent />;
}