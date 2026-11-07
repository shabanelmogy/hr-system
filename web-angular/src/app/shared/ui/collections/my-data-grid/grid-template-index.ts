import { computed, type Signal, type TemplateRef } from '@angular/core';

/** Index projected templates once per query/key change, preserving first-match semantics. */
export function indexGridTemplates<T extends { readonly template: TemplateRef<C> }, C>(
  templates: Signal<readonly T[]>,
  key: (template: T) => string,
) {
  return computed(() => {
    const index = new Map<string, TemplateRef<C>>();
    for (const template of templates()) {
      const id = key(template);
      if (!index.has(id)) index.set(id, template.template);
    }
    return index;
  });
}
