import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | HR Management System",
  description: "HR Management System page for Register."
};

import PageComponent from "@/features/auth/register/Register";
import { publicSelfRegistrationEnabled } from "@/config/publicEnv";
import { appRoutes } from "@/config/routes";
import { redirect } from "next/navigation";

export default function Page() {
  if (!publicSelfRegistrationEnabled) {
    redirect(appRoutes.login);
  }

  return <PageComponent />;
}
