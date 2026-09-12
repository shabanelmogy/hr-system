import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Track Changes | ERP System",
  description: "ERP System page for Advanced Tools Track Changes."
};

import PageComponent from "@/platform/advanced-tools/track-changes/pages/TrackChangesPage";

export default function Page() {
  return <PageComponent />;
}
