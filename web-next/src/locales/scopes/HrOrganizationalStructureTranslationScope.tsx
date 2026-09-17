"use client";

import type { ReactNode } from "react";
import en from "../resources/hr-org-structure/en.json";
import ar from "../resources/hr-org-structure/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "hr-org-structure";
registerStaticNamespace(namespace, { en, ar });

export function HrOrganizationalStructureTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
