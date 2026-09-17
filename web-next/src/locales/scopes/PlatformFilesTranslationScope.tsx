"use client";

import type { ReactNode } from "react";
import en from "../resources/platform-files/en.json";
import ar from "../resources/platform-files/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";

const namespace = "platform-files";
registerStaticNamespace(namespace, { en, ar });

export function PlatformFilesTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
