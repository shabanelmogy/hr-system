import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Localization Api | ERP System",
  description: "ERP System page for Advanced Tools Localization Api."
};

import PageComponent from "@/platform/advanced-tools/localization/pages/LocalizationPage";

export default function Page() {
  return <PageComponent />;
}
