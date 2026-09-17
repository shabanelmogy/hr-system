"use client";

import type { ReactNode } from "react";
import en from "../resources/hr-workforce/en.json";
import ar from "../resources/hr-workforce/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "hr-workforce";
registerStaticNamespace(namespace, { en, ar });

export function HrWorkforceTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
