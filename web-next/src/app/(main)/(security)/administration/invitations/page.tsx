import type { Metadata } from "next";
import InvitationsPage from "@/features/auth/invitations/InvitationsPage";

export const metadata: Metadata = {
  title: "Administration Invitations | HR Management System",
  description: "Invite users and manage pending account invitations.",
};

export default function Page() {
  return <InvitationsPage />;
}
