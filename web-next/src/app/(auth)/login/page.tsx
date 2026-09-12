import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | ERP System",
  description: "ERP System page for Login."
};

import PageComponent from "@/platform/auth/login/Login";

export default function Page() {
  return <PageComponent />;
}