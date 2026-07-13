import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data Address Types | HR Management System",
  description: "HR Management System page for Basic Data Address Types."
};

import PageComponent from "@/features/basic-data/geographical-information/address-types/pages/AddressTypesPage";

export default function Page() {
  return <PageComponent />;
}
