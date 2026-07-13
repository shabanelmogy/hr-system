import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Files | HR Management System",
  description: "HR Management System page for Files."
};

import PageComponent from "@/features/file-manager/pages/FilesPage";

export default function Page() {
  return <PageComponent />;
}