import * as z from 'zod/mini';
import { stateLookupSchema } from './state';
export type { StateLookup } from './state';
export { stateLookupSchema } from './state';

/** The endpoint returns active States; its contract has no isDeleted member. */
export function parseStateLookup(input: unknown) {
  const values = z.array(stateLookupSchema).parse(input);
  if (new Set(values.map((value) => value.id)).size !== values.length)
    throw Error('Duplicate active State lookup identity');
  return values;
}
