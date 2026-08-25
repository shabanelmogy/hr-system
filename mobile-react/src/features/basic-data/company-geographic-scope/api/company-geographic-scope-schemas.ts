import { z } from 'zod';

import type { CompanyGeographicScope } from '../types/company-geographic-scope';

const companyCountryOptionSchema = z.object({
  id: z.number().int().positive(),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  alpha2Code: z.string().nullable(),
  alpha3Code: z.string().nullable(),
  isSelected: z.boolean(),
  isDefault: z.boolean(),
});

export const companyGeographicScopeSchema: z.ZodType<CompanyGeographicScope> = z.object({
  companyId: z.number().int().positive(),
  defaultCountryId: z.number().int().positive().nullable(),
  countries: z.array(companyCountryOptionSchema),
});
