import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kpis | HR Management System",
  description: "HR Management System page for Kpis."
};

import PageComponent from "@/features/home/pages/KpisPage";

export default function Page() {
  return <PageComponent />;
}