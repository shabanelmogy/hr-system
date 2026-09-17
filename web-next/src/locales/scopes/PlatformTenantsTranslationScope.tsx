"use client";

import type { ReactNode } from "react";
import en from "../resources/platform-tenants/en.json";
import ar from "../resources/platform-tenants/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "platform-tenants";
registerStaticNamespace(namespace, { en, ar });

export function PlatformTenantsTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
