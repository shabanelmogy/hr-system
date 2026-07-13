import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resend Email Confirmation | HR Management System",
  description: "HR Management System page for Resend Email Confirmation."
};

import PageComponent from "@/features/auth/ResendEmailConfirmation";

export default function Page() {
  return <PageComponent />;
}