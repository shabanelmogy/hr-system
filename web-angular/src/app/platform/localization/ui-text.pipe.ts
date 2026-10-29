import { inject, Pipe, type PipeTransform } from '@angular/core';
import type { TOptions } from 'i18next';
import { LocalizationRuntime } from './localization-runtime';

/** Impure by design: translation revision/language signals must repaint zoneless views. */
@Pipe({ name: 'uiText', pure: false })
export class UiTextPipe implements PipeTransform {
  private readonly runtime = inject(LocalizationRuntime);
  transform(key: string, namespace = 'core', options: TOptions = {}): string {
    return this.runtime.translate(key, namespace, options);
  }
}
