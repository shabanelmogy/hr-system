import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data Address Types | ERP System",
  description: "ERP System page for Basic Data Address Types."
};

import PageComponent from "@/modules/hr/basic-data/geographical-information/address-types/pages/AddressTypesPage";

export default function Page() {
  return <PageComponent />;
}
