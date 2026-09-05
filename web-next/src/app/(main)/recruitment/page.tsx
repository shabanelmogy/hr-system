import type { Metadata } from "next";
import PageComponent from "@/features/recruitment/pages/RecruitmentPage";

export const metadata: Metadata = {
  title: "Recruitment & Hiring Lifecycle | HR Management System",
  description: "Enterprise Odoo-competing recruitment, job openings, candidate pipeline, and hiring module.",
};

export default function Page() {
  return <PageComponent />;
}
