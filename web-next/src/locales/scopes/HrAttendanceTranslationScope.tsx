"use client";

import type { ReactNode } from "react";
import en from "../resources/hr-attendance/en.json";
import ar from "../resources/hr-attendance/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "hr-attendance";
registerStaticNamespace(namespace, { en, ar });

export function HrAttendanceTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
