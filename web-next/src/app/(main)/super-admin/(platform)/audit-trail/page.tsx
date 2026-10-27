import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Trail | ERP System",
  description: "Every create, change, delete and restore recorded across the ERP System."
};

import { PlatformAdvancedToolsTranslationScope } from "@/locales/scopes/PlatformAdvancedToolsTranslationScope";
import { AuditTrailPage as PageComponent } from "@/platform/audit-trail";

export default function Page() {
  return <PlatformAdvancedToolsTranslationScope><PageComponent /></PlatformAdvancedToolsTranslationScope>;
}
