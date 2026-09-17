import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointments | ERP System",
  description: "ERP System page for Appointments."
};

import PageComponent from "@/modules/crm/appointments/pages/AppointmentsPage";

export default function Page() {
  return <PageComponent />;
}
