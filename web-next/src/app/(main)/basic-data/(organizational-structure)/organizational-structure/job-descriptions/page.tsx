import type { Metadata } from "next";
import { JobDescriptionsPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Job Descriptions | HR Management System" };

export default function Page() {
  return <JobDescriptionsPage />;
}
