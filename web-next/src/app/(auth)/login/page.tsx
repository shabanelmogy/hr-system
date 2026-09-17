import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | ERP System",
  description: "ERP System page for Login."
};

import { LoginPage as PageComponent } from "@/platform/auth/login";

export default function Page() {
  return <PageComponent />;
}
