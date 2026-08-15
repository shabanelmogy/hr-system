import type { Metadata } from "next";

import PageComponent from "@/features/auth/EmailConfirmed";

export const metadata: Metadata = {
  title: "Email Confirmation | HR Management System",
  description: "Confirm an account email address."
};

export default function Page() {
  return <PageComponent />;
}
