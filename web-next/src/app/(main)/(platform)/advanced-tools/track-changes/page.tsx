import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Track Changes | HR Management System",
  description: "HR Management System page for Advanced Tools Track Changes."
};

import PageComponent from "@/features/advanced-tools/track-changes/pages/TrackChangesPage";

export default function Page() {
  return <PageComponent />;
}
