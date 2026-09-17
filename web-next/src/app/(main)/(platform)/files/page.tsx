import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Files | ERP System",
  description: "ERP System page for Files."
};

import { FilesPage as PageComponent } from "@/platform/file-manager/pages";

export default function Page() {
  return <PageComponent />;
}
