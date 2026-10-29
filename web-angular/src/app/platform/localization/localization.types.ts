import * as z from 'zod/mini';

const languageSchema = z.enum(['en', 'ar']);
export type UiLanguage = z.infer<typeof languageSchema>;
const overrideSchema = z.object({ namespace: z.string().check(z.minLength(1)), language: languageSchema, key: z.string().check(z.minLength(1)), value: z.string().check(z.maxLength(4000)) });
export const companyRuntimeSchema = z.object({ tenantId: z.string().check(z.minLength(1)), companyId: z.int().check(z.positive()), defaultLanguage: languageSchema,
  revision: z.int().check(z.nonnegative()), catalogVersion: z.string().check(z.minLength(1)), overrides: z.array(overrideSchema).check(z.maxLength(5000)) });
export const systemRuntimeSchema = z.strictObject(z.omit(companyRuntimeSchema, { tenantId: true, companyId: true, defaultLanguage: true }).shape);
export type CompanyRuntime = z.infer<typeof companyRuntimeSchema>;
export type SystemRuntime = z.infer<typeof systemRuntimeSchema>;
export type UiOverride = z.infer<typeof overrideSchema>;
export interface LocalizationIdentity { userId: string; tenantId: string; companyId: number; roles: readonly string[]; permissions: readonly string[] }
export interface NamespaceResources { en: Record<string, string>; ar: Record<string, string> }
export interface TextWrite { source: string; language: UiLanguage; key: string; value: string; expectedRevision: number }
export type TextReset = Omit<TextWrite, 'value'>;
export type LocalizationTarget = 'company' | 'system';
