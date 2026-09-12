import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance Trends | ERP System",
  description: "ERP System page for Attendance Trends."
};

import PageComponent from "@/modules/hr/home/pages/AttendanceTrendsPage";

export default function Page() {
  return <PageComponent />;
}