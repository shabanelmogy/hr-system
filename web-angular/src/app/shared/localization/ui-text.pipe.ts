import { inject, Pipe, type PipeTransform } from '@angular/core';
import type { TOptions } from 'i18next';
import { UI_LOCALIZATION } from './localization';

/** Translation revisions/language signals repaint zoneless views. */
@Pipe({ name: 'uiText', pure: false })
export class UiTextPipe implements PipeTransform {
  private readonly runtime = inject(UI_LOCALIZATION);
  transform(key: string, namespace = 'core', options: TOptions = {}): string {
    return this.runtime.translate(key, namespace, options);
  }
}
