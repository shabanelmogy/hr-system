"use client";

import type { ReactNode } from "react";
import en from "../resources/reference-countries/en.json";
import ar from "../resources/reference-countries/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "reference-countries";
registerStaticNamespace(namespace, { en, ar });

export function ReferenceCountriesTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
