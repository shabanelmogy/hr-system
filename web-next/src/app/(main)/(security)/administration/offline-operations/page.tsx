import type { Metadata } from "next";
import { OfflineOperationsPage } from "@/platform/offline-operations";

export const metadata: Metadata = {
  title: "Offline Operations | ERP System",
  description: "Manage tenant and company offline execution policy.",
};

export default function Page() {
  return <OfflineOperationsPage />;
}
