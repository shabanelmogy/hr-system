"use client";

import type { ReactNode } from "react";
import en from "../resources/hr-recruitment/en.json";
import ar from "../resources/hr-recruitment/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "hr-recruitment";
registerStaticNamespace(namespace, { en, ar });

export function HrRecruitmentTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
