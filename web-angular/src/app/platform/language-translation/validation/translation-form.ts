import { signal } from '@angular/core';
import { form, metadata, REQUIRED, validate, type FormOptions } from '@angular/forms/signals';
import { translationValueError } from '../types/language-translation';
export interface TranslationDraft {
  value: string;
}
export function createTranslationForm(
  shipped: () => string,
  options: FormOptions<TranslationDraft> = {},
) {
  return form(
    signal<TranslationDraft>({ value: '' }),
    (path) => {
      metadata(path.value, REQUIRED, () => true);
      validate(path.value, ({ value }) => {
        const kind = translationValueError(value(), shipped());
        return kind ? { kind } : undefined;
      });
    },
    options,
  );
}
