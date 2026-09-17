"use client";

import type { ReactNode } from "react";
import en from "../resources/platform-advanced-tools/en.json";
import ar from "../resources/platform-advanced-tools/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "platform-advanced-tools";
registerStaticNamespace(namespace, { en, ar });

export function PlatformAdvancedToolsTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
