import type { Metadata } from "next";
import { AcceptInvitationPage } from "@/platform/auth/route-pages";

export const metadata: Metadata = {
  title: "Accept Invitation | ERP System",
  description: "Activate an invited ERP System account.",
};

export default function Page() {
  return <AcceptInvitationPage />;
}
