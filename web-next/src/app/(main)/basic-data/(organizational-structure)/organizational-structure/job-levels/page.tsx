import type { Metadata } from "next";
import { JobLevelsPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Job Levels | HR Management System" };

export default function Page() {
  return <JobLevelsPage />;
}
