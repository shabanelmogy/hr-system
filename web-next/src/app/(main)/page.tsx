import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | HR Management System",
  description: "HR management dashboard overview."
};

import PageComponent from "@/features/home/pages/HomePage";

export default function Page() {
  return <PageComponent />;
}