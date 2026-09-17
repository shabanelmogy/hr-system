"use client";

import type { ReactNode } from "react";
import en from "../resources/reference-states/en.json";
import ar from "../resources/reference-states/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "reference-states";
registerStaticNamespace(namespace, { en, ar });

export function ReferenceStatesTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
