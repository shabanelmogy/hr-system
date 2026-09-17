"use client";

import type { ReactNode } from "react";
import en from "../resources/accounting/en.json";
import ar from "../resources/accounting/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "accounting";
registerStaticNamespace(namespace, { en, ar });

export function AccountingTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
