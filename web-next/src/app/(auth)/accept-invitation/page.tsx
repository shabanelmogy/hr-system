import type { Metadata } from "next";
import AcceptInvitationPage from "@/features/auth/accept-invitation/AcceptInvitationPage";

export const metadata: Metadata = {
  title: "Accept Invitation | HR Management System",
  description: "Activate an invited HR Management System account.",
};

export default function Page() {
  return <AcceptInvitationPage />;
}
