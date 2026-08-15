import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend Email Confirmation | HR Management System",
  description: "HR Management System page for Resend Email Confirmation."
};

import PageComponent from "@/features/auth/ResendEmailConfirmation";
import { publicSelfRegistrationEnabled } from "@/config/publicEnv";
import { appRoutes } from "@/config/routes";
import { redirect } from "next/navigation";

export default function Page() {
  if (!publicSelfRegistrationEnabled) {
    redirect(appRoutes.login);
  }

  return <PageComponent />;
}
