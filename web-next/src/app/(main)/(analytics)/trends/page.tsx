import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trends | HR Management System",
  description: "HR Management System page for Trends."
};

import PageComponent from "@/features/home/pages/TrendsPage";

export default function Page() {
  return <PageComponent />;
}