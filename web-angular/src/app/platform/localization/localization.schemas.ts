import * as z from 'zod/mini';

const languageSchema = z.enum(['en', 'ar']);
const overrideSchema = z.object({
  namespace: z.string().check(z.minLength(1)),
  language: languageSchema,
  key: z.string().check(z.minLength(1)),
  value: z.string().check(z.maxLength(4000)),
});

/** Validate untrusted API responses at the service boundary. */
export const companyRuntimeSchema = z.object({
  tenantId: z.string().check(z.minLength(1)),
  companyId: z.int().check(z.positive()),
  defaultLanguage: languageSchema,
  revision: z.int().check(z.nonnegative()),
  catalogVersion: z.string().check(z.minLength(1)),
  overrides: z.array(overrideSchema).check(z.maxLength(5000)),
});

export const systemRuntimeSchema = z.strictObject(
  z.omit(companyRuntimeSchema, { tenantId: true, companyId: true, defaultLanguage: true }).shape,
);
export const systemLocalizationTextsSchema = z.object({
  revision: z.int().check(z.nonnegative()),
  items: z.array(
    z.object({
      key: z.string().check(z.minLength(1)),
      baseValue: z.string(),
      targetValue: z.string(),
      shippedValue: z.string(),
      isCustomized: z.boolean(),
    }),
  ),
  totalCount: z.int().check(z.nonnegative()),
  page: z.int().check(z.positive()),
  pageSize: z.int().check(z.positive()),
  catalogVersion: z.string().check(z.minLength(1)),
});
