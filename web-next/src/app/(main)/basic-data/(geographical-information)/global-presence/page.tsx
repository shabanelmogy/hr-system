import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Presence | HR Management System",
  description: "HR Management System page for Global Presence."
};

import PageComponent from "@/features/basic-data/geographical-information/global-presence/pages/GlobalPresencePage";

export default function Page() {
  return <PageComponent />;
}
