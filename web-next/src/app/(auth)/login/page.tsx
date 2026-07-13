import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | HR Management System",
  description: "HR Management System page for Login."
};

import PageComponent from "@/features/auth/login/Login";

export default function Page() {
  return <PageComponent />;
}