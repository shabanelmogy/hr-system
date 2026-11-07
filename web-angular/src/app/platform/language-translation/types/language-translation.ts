import * as z from 'zod/mini';
import type { UiLanguage } from '../../localization/public-api';
const language = z.enum(['en', 'ar']);
export const translationSettingsSchema = z.strictObject({
  revision: z.int().check(z.nonnegative()),
  languages: z.array(language),
  sources: z.array(
    z.object({
      id: z.string().check(z.minLength(1)),
      client: z.enum(['web', 'mobile']),
      namespace: z.string().check(z.minLength(1)),
    }),
  ),
  catalogVersions: z.record(z.string(), z.string()),
});
export const translationPageSchema = z.object({
  revision: z.int().check(z.nonnegative()),
  catalogVersion: z.string().check(z.minLength(1)),
  totalCount: z.int().check(z.nonnegative()),
  page: z.int().check(z.positive()),
  pageSize: z.int().check(z.positive()),
  items: z.array(
    z.object({
      key: z.string().check(z.minLength(1)),
      baseValue: z.string(),
      targetValue: z.string(),
      shippedValue: z.string(),
      isCustomized: z.boolean(),
    }),
  ),
});
export type TranslationSettings = z.infer<typeof translationSettingsSchema>;
export type TranslationPage = z.infer<typeof translationPageSchema>;
export type LanguageTranslationRow = TranslationPage['items'][number];
export type TranslationStatus = 'all' | 'missing' | 'customized';
export interface TranslationQuery {
  readonly source: string;
  readonly baseLanguage: UiLanguage;
  readonly targetLanguage: UiLanguage;
  readonly status: TranslationStatus;
  readonly search: string;
  readonly page: number;
  readonly pageSize: number;
}
export function resolveTranslationSource(requested: string, settings: TranslationSettings): string {
  return (
    settings.sources.find((source) => source.id === requested)?.id ??
    settings.sources.find((source) => source.client === 'web')?.id ??
    settings.sources[0]?.id ??
    ''
  );
}
export function translationValueError(
  value: string,
  shipped: string,
): 'required' | 'maxlength' | 'placeholders' | null {
  if (!value.trim()) return 'required';
  if (value.length > 4000) return 'maxlength';
  const placeholders = (text: string) =>
    JSON.stringify((text.match(/\{\{[^{}]+\}\}|\{\d+(?:[^{}]*)\}|<\/?\d+>/g) ?? []).sort());
  return placeholders(value) === placeholders(shipped) ? null : 'placeholders';
}
