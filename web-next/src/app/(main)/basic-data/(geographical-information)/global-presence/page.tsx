import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Presence | ERP System",
  description: "ERP System page for Global Presence."
};

import PageComponent from "@/modules/hr/basic-data/geographical-information/global-presence/pages/GlobalPresencePage";

export default function Page() {
  return <PageComponent />;
}
