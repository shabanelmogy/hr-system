import type { Metadata } from "next";
import { ErrorLogsPage } from "@/platform/error-logs";
import { PlatformAdvancedToolsTranslationScope } from "@/locales/scopes/PlatformAdvancedToolsTranslationScope";

export const metadata: Metadata = { title: "System Error Logs | ERP System" };
export default function Page() { return <PlatformAdvancedToolsTranslationScope><ErrorLogsPage scope="system" /></PlatformAdvancedToolsTranslationScope>; }
