import type { Metadata } from "next";
import { JobTitlesPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Job Titles | HR Management System" };

export default function Page() {
  return <JobTitlesPage />;
}
