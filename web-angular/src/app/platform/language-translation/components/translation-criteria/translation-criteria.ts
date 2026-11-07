import { Component, computed, inject } from '@angular/core';
import { OptionSelect } from '../../../../shared/ui/public-api';
import { LocalizationRuntime } from '../../../localization/public-api';
import { LanguageTranslationState } from '../../state/language-translation-state';
@Component({
  selector: 'erp-translation-criteria',
  imports: [OptionSelect],
  templateUrl: './translation-criteria.html',
  styleUrl: './translation-criteria.scss',
})
export class TranslationCriteria {
  readonly reads = inject(LanguageTranslationState);
  private readonly locale = inject(LocalizationRuntime);
  readonly languages = computed(() =>
    (['en', 'ar'] as const).map((value) => ({
      value,
      label: this.text(value === 'en' ? 'english' : 'arabic'),
    })),
  );
  readonly sources = computed(() =>
    (this.reads.settings()?.sources ?? []).map((source) => ({
      value: source.id,
      label: this.text(source.client) + ' · ' + source.namespace,
    })),
  );
  readonly statuses = computed(() =>
    (['all', 'missing', 'customized'] as const).map((value) => ({
      value,
      label: this.text(value),
    })),
  );
  text(key: string): string {
    return this.locale.translate('companyLocalizations.' + key, 'platform-auth');
  }
  language(value: string, target: boolean): void {
    if (value === 'en' || value === 'ar')
      this.reads.patch(target ? { targetLanguage: value } : { baseLanguage: value });
  }
  status(value: string): void {
    if (value === 'all' || value === 'missing' || value === 'customized')
      this.reads.patch({ status: value });
  }
}
