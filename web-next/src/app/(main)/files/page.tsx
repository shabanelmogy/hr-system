import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Files | ERP System",
  description: "ERP System page for Files."
};

import PageComponent from "@/platform/file-manager/pages/FilesPage";

export default function Page() {
  return <PageComponent />;
}