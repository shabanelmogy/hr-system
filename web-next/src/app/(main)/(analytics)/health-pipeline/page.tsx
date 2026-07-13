import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Pipeline | HR Management System",
  description: "HR Management System page for Health Pipeline."
};

import PageComponent from "@/features/home/pages/HealthPipelinePage";

export default function Page() {
  return <PageComponent />;
}