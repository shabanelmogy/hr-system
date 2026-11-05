import type * as z from 'zod/mini';
import type { companyRuntimeSchema, systemRuntimeSchema } from './localization.schemas';

export type CompanyRuntime = z.infer<typeof companyRuntimeSchema>;
export type SystemRuntime = z.infer<typeof systemRuntimeSchema>;
export type UiOverride = CompanyRuntime['overrides'][number];
export type UiLanguage = UiOverride['language'];
export interface LocalizationIdentity { userId: string; tenantId: string; companyId: number; roles: readonly string[]; permissions: readonly string[] }
export interface NamespaceResources { en: Record<string, string>; ar: Record<string, string> }
export interface TextWrite { source: string; language: UiLanguage; key: string; value: string; expectedRevision: number }
export type TextReset = Omit<TextWrite, 'value'>;
export type LocalizationTarget = 'company' | 'system';
