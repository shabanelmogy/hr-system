import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data Address Types | ERP System",
  description: "ERP System page for Basic Data Address Types."
};

import { AddressTypesPage as PageComponent } from "@/modules/reference-data/geographical-information/address-types";

export default function Page() {
  return <PageComponent />;
}
