import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data States | ERP System",
  description: "ERP System page for Basic Data States."
};

import { StatesPage } from "@/modules/hr/basic-data/geographical-information/states";

export default function Page() {
  return <StatesPage />;
}
