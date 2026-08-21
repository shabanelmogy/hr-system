import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data States | HR Management System",
  description: "HR Management System page for Basic Data States."
};

import { StatesPage } from "@/features/basic-data/geographical-information/states";

export default function Page() {
  return <StatesPage />;
}
