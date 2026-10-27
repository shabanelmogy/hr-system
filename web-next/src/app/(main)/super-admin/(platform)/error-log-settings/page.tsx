import type { Metadata } from "next";
import { ErrorLogSettingsPage } from "@/platform/error-logs";
import { PlatformAdvancedToolsTranslationScope } from "@/locales/scopes/PlatformAdvancedToolsTranslationScope";

export const metadata: Metadata = { title: "Error Log Settings | ERP System" };
export default function Page() { return <PlatformAdvancedToolsTranslationScope><ErrorLogSettingsPage /></PlatformAdvancedToolsTranslationScope>; }
