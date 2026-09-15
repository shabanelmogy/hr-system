import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointments | ERP System",
  description: "ERP System page for Appointments."
};

import { AppointmentsPage as PageComponent } from "@/modules/crm";

export default function Page() {
  return <PageComponent />;
}
