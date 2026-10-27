import type { Metadata } from "next";
import { ErrorLogsPage } from "@/platform/error-logs";

export const metadata: Metadata = { title: "Error Logs | ERP System" };
export default function Page() { return <ErrorLogsPage scope="company" />; }
