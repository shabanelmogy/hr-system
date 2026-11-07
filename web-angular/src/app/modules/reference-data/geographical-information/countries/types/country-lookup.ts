import * as z from 'zod/mini';

const int32 = z.int().check(z.minimum(1), z.maximum(2147483647));
export const countryLookupSchema = z.object({
  id: int32,
  nameAr: z.string().check(z.minLength(1)),
  nameEn: z.string().check(z.minLength(1)),
  isDeleted: z.boolean(),
});
export type CountryLookup = z.infer<typeof countryLookupSchema>;
export function parseCountryLookup(input: unknown): readonly CountryLookup[] {
  const values = z.array(countryLookupSchema).parse(input);
  if (
    new Set(values.map((value) => value.id)).size !== values.length ||
    values.some((value) => value.isDeleted)
  )
    throw Error('Invalid active Country lookup response');
  return values;
}
