import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attendance Trends | HR Management System",
  description: "HR Management System page for Attendance Trends."
};

import PageComponent from "@/features/home/pages/AttendanceTrendsPage";

export default function Page() {
  return <PageComponent />;
}