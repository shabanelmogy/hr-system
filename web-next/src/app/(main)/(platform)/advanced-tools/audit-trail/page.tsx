import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Trail | ERP System",
  description: "Every create, change, delete and restore recorded across the ERP System."
};

import { AuditTrailPage as PageComponent } from "@/platform/audit-trail";

export default function Page() {
  return <PageComponent />;
}
