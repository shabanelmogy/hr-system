import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data States | HR Management System",
  description: "HR Management System page for Basic Data States."
};

import PageComponent from "@/features/basic-data/geographical-information/states/pages/StatesPage";

export default function Page() {
  return <PageComponent />;
}
