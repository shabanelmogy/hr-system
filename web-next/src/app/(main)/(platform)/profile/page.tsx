import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | ERP System",
  description: "ERP System page for Profile."
};

import { ProfilePage as PageComponent } from "@/platform/auth/profile/route";

export default function Page() {
  return <PageComponent />;
}
