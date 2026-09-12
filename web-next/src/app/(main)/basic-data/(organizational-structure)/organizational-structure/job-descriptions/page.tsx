import type { Metadata } from "next";
import { JobDescriptionsPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Job Descriptions | ERP System" };

export default function Page() {
  return <JobDescriptionsPage />;
}
