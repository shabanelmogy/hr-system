import type { Metadata } from "next";
import { JobLevelsPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Job Levels | ERP System" };

export default function Page() {
  return <JobLevelsPage />;
}
