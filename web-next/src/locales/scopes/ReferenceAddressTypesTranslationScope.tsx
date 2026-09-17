"use client";

import type { ReactNode } from "react";
import en from "../resources/reference-address-types/en.json";
import ar from "../resources/reference-address-types/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "reference-address-types";
registerStaticNamespace(namespace, { en, ar });

export function ReferenceAddressTypesTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
