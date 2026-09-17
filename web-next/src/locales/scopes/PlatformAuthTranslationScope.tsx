"use client";

import type { ReactNode } from "react";
import en from "../resources/platform-auth/en.json";
import ar from "../resources/platform-auth/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "platform-auth";
registerStaticNamespace(namespace, { en, ar });

export function PlatformAuthTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
