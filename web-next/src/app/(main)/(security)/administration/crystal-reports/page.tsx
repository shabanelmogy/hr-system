import type { Metadata } from "next";
import { CrystalReportManagerPage } from "@/features/reporting/crystal-report-manager";

export const metadata: Metadata = { title: "Crystal Reports", description: "Manage Crystal report files, versions, and company access." };
export default function Page() { return <CrystalReportManagerPage />; }
