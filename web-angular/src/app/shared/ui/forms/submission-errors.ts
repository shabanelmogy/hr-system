import { isFieldTree, type FieldTree, type ValidationError } from '@angular/forms/signals';

const unsafeKeys = new Set(['__proto__', 'prototype', 'constructor']);

/** Translate API paths to native submission errors, retaining unknown paths at the root.
 * Pass the immutable model value captured before the request. Changed fields and
 * changed array membership/order never receive an older response's error.
 */
export function mapServerFieldErrors<T>(
  form: FieldTree<T>,
  errors: Readonly<Record<string, string>>,
  submitted: T,
): ValidationError.WithFieldTree[] {
  const result: ValidationError.WithFieldTree[] = [];
  for (const [path, message] of Object.entries(errors)) {
    let field: unknown = form;
    let previous: unknown = submitted;
    let stale = false;
    for (const key of path.replace(/\[(\d+)\]/g, '.$1').split('.')) {
      if (
        !key ||
        unsafeKeys.has(key) ||
        !isFieldTree(field) ||
        previous === null ||
        typeof previous !== 'object' ||
        !Object.hasOwn(previous, key)
      ) {
        field = undefined;
        break;
      }
      const current: unknown = field().value();
      if (
        Array.isArray(previous) &&
        (!Array.isArray(current) ||
          current.length !== previous.length ||
          previous.some((item, index) => !Object.is(item, current[index])))
      ) {
        stale = true;
        break;
      }
      field = Reflect.get(field, key);
      previous = Reflect.get(previous, key);
    }
    if (stale) continue;
    if (isFieldTree(field)) {
      if (Object.is(field().value(), previous))
        result.push({ kind: 'server', message, fieldTree: field });
    } else result.push({ kind: 'server', message, fieldTree: form });
  }
  return result;
}
