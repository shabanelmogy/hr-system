import type { Metadata } from "next";
import { RecruitmentPage as PageComponent } from "@/modules/hr/recruitment";

export const metadata: Metadata = {
  title: "Recruitment & Hiring Lifecycle | ERP System",
  description: "Enterprise Odoo-competing recruitment, job openings, candidate pipeline, and hiring module.",
};

export default function Page() {
  return <PageComponent />;
}
