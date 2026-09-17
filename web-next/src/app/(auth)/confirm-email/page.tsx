import type { Metadata } from "next";

import { ConfirmEmailPage as PageComponent } from "@/platform/auth/confirm-email";

export const metadata: Metadata = {
  title: "Email Confirmation | ERP System",
  description: "Confirm an account email address."
};

export default function Page() {
  return <PageComponent />;
}
