import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "File Viewer | HR Management System",
  description: "Preview and download files in HR Management System."
};

import PageComponent from "@/features/file-manager/media-viewer/pages/MediaViewer";

export default function Page() {
  return <PageComponent />;
}
