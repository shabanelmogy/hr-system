import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Localization Api | HR Management System",
  description: "HR Management System page for Advanced Tools Localization Api."
};

import PageComponent from "@/features/advanced-tools/localization/pages/LocalizationPage";

export default function Page() {
  return <PageComponent />;
}
