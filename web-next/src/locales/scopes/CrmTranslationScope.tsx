"use client";

import type { ReactNode } from "react";
import en from "../resources/crm/en.json";
import ar from "../resources/crm/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "crm";
registerStaticNamespace(namespace, { en, ar });

export function CrmTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
