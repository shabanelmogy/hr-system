import { createMetadataKey, MAX, metadata, MIN, validate, type SchemaPath } from '@angular/forms/signals';
import { dateOnlyErrors, firstDateOnly, lastDateOnly } from './fields/date-only';
import { numericTextErrors, type NumericOptions } from './fields/numeric-text';

const stringMinimum = createMetadataKey<string | undefined>();
const stringMaximum = createMetadataKey<string | undefined>();

function nativeErrors(errors: Readonly<Record<string, unknown>> | null) {
  return errors ? Object.entries(errors).map(([kind, detail]) => ({ kind, ...(typeof detail === 'object' && detail !== null ? detail : {}) })) : undefined;
}

/** Exact decimal-string rules belong to the native schema, never an internal vendor control. */
export function validateNumericText(path: SchemaPath<string>, options: () => Partial<NumericOptions> = () => ({})): void {
  metadata(path, MIN, () => stringMinimum);
  metadata(path, stringMinimum, () => options().min ?? undefined);
  metadata(path, MAX, () => stringMaximum);
  metadata(path, stringMaximum, () => options().max ?? undefined);
  validate(path, ({ value }) => nativeErrors(numericTextErrors(value(), options())));
}

/** Date-only values stay invariant strings without timezone conversion. */
export function validateDateOnly(path: SchemaPath<string>, bounds: () => { min: string; max: string } = () => ({ min: firstDateOnly, max: lastDateOnly })): void {
  metadata(path, MIN, () => stringMinimum);
  metadata(path, stringMinimum, () => bounds().min);
  metadata(path, MAX, () => stringMaximum);
  metadata(path, stringMaximum, () => bounds().max);
  validate(path, ({ value }) => { const { min, max } = bounds(); return nativeErrors(dateOnlyErrors(value(), min, max)); });
}
