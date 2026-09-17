import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "File Viewer | ERP System",
  description: "Preview and download files in ERP System."
};

import PageComponent from "@/platform/file-manager/media-viewer/pages/MediaViewer";

export default function Page() {
  return <PageComponent />;
}
