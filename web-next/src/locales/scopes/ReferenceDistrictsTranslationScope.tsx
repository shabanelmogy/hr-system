"use client";

import type { ReactNode } from "react";
import en from "../resources/reference-districts/en.json";
import ar from "../resources/reference-districts/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "reference-districts";
registerStaticNamespace(namespace, { en, ar });

export function ReferenceDistrictsTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
