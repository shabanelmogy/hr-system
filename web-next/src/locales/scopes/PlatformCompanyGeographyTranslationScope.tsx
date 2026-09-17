"use client";

import type { ReactNode } from "react";
import en from "../resources/platform-company-geography/en.json";
import ar from "../resources/platform-company-geography/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "platform-company-geography";
registerStaticNamespace(namespace, { en, ar });

export function PlatformCompanyGeographyTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
