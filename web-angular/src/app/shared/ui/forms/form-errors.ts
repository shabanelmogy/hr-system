import { AbstractControl } from '@angular/forms';

export type FieldMessages = Readonly<Record<string, string | ((details: unknown) => string)>>;

/** Returns unmapped messages so the caller can show them as form-level feedback. */
export function applyServerFieldErrors(form: AbstractControl, errors: Readonly<Record<string, string>>): Record<string, string> {
  const unmatched: Record<string, string> = {};
  for (const [path, message] of Object.entries(errors)) {
    const segments = path.replace(/\[(\d+)\]/g, '.$1').split('.');
    const control = segments.some(segment => ['__proto__', 'prototype', 'constructor'].includes(segment)) ? null : form.get(segments);
    if (!control) { unmatched[path] = message; continue; }
    control.setErrors({ ...control.errors, server: message });
    control.markAsTouched();
  }
  return unmatched;
}

export function clearServerFieldError(control: AbstractControl | null): void {
  if (!control?.errors || !Object.hasOwn(control.errors, 'server')) return;
  const { server: ignored, ...remaining } = control.errors;
  control.setErrors(Object.keys(remaining).length ? remaining : null);
}
