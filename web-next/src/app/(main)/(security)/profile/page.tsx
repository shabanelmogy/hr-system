import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | ERP System",
  description: "ERP System page for Profile."
};

import PageComponent from "@/platform/auth/profile/ProfilePage";

export default function Page() {
  return <PageComponent />;
}