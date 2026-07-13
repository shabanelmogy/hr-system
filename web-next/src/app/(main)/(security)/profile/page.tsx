import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | HR Management System",
  description: "HR Management System page for Profile."
};

import PageComponent from "@/features/auth/profile/ProfilePage";

export default function Page() {
  return <PageComponent />;
}