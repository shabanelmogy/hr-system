import type { Metadata } from "next";
import { JobTitlesPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Job Titles | ERP System" };

export default function Page() {
  return <JobTitlesPage />;
}
