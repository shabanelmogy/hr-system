import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appointments | HR Management System",
  description: "HR Management System page for Appointments."
};

import PageComponent from "@/features/appointments/pages/AppointmentsPage";

export default function Page() {
  return <PageComponent />;
}