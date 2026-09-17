"use client";

import type { ReactNode } from "react";
import en from "../resources/reporting/en.json";
import ar from "../resources/reporting/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "reporting";
registerStaticNamespace(namespace, { en, ar });

export function ReportingTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
