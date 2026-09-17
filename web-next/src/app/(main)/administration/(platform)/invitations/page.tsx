import type { Metadata } from "next";
import { InvitationsPage } from "@/platform/auth/invitations/route";

export const metadata: Metadata = {
  title: "Administration Invitations | ERP System",
  description: "Invite users and manage pending account invitations.",
};

export default function Page() {
  return <InvitationsPage />;
}
