import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Confirmation | HR Management System",
  description: "Confirm an account email address."
};

import PageComponent from "@/features/auth/EmailConfirmed";

export default function Page() {
  return <PageComponent />;
}
