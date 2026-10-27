"use client";
import type { ReactNode } from "react";
import en from "../resources/platform-messages/en.json";
import ar from "../resources/platform-messages/ar.json";
import { registerStaticNamespace, StaticTranslationScope } from "../StaticTranslationScope";
const namespace = "platform-messages";
registerStaticNamespace(namespace, { en, ar });
export function PlatformMessagesTranslationScope({ children }: { children: ReactNode }) {
  return <StaticTranslationScope namespace={namespace}>{children}</StaticTranslationScope>;
}
