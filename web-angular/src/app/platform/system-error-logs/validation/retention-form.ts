import { signal } from '@angular/core';
import { form, metadata, REQUIRED, validate, type FormOptions } from '@angular/forms/signals';

export interface RetentionDraft {
  retentionDays: string;
}

export function retentionFieldError(value: string): 'required' | 'range' | null {
  const text = value.trim();
  if (!text) return 'required';
  const days = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(days) && days >= 1 && days <= 3650
    ? null
    : 'range';
}

export function parseRetentionDraft(draft: RetentionDraft): number {
  if (retentionFieldError(draft.retentionDays)) throw Error('Invalid retention period');
  return Number(draft.retentionDays.trim());
}

export function createRetentionForm(options: FormOptions<RetentionDraft> = {}) {
  return form(
    signal<RetentionDraft>({ retentionDays: '' }),
    (path) => {
      metadata(path.retentionDays, REQUIRED, () => true);
      validate(path.retentionDays, ({ value }) => {
        const kind = retentionFieldError(value());
        return kind ? { kind } : undefined;
      });
    },
    options,
  );
}
