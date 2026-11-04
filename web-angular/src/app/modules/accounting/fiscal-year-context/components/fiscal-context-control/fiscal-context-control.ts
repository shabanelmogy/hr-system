import { Component, computed, inject, signal } from '@angular/core';
import { AuthSession } from '../../../../../platform/auth/session.public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import { ActionButton, AppIcon, OptionSelect } from '../../../../../shared/ui/public-api';
import { FiscalContextState } from '../../state/fiscal-context-state';
@Component({
  selector: 'erp-fiscal-context',
  imports: [OptionSelect, ActionButton, AppIcon, UiTextPipe],
  templateUrl: './fiscal-context-control.html',
  styleUrl: './fiscal-context-control.scss',
})
export class FiscalContextControl {
  readonly state = inject(FiscalContextState);
  readonly auth = inject(AuthSession);
  private readonly locale = inject(LocalizationRuntime);
  readonly captions = signal(false);
  readonly captionError = signal(false);
  readonly failed = computed(() => ['error', 'forbidden'].includes(this.state.state().kind));
  readonly value = computed(() => String(this.state.context()?.selectedFiscalYear?.id ?? ''));
  readonly options = computed(
    () =>
      this.state.context()?.availableFiscalYears.map((y) => ({
        value: String(y.id),
        label:
          (this.locale.language() === 'ar' ? y.nameAr : y.nameEn).trim() ||
          (this.locale.language() === 'ar' ? y.nameEn : y.nameAr).trim() ||
          y.code,
        description: y.isCurrent
          ? this.locale.translate('fiscalYears.context.companyCurrent', 'accounting')
          : y.startDate + ' — ' + y.endDate,
      })) ?? [],
  );
  constructor() {
    void this.loadCaptions();
  }
  async loadCaptions() {
    this.captionError.set(false);
    try {
      await this.locale.loadNamespace('accounting');
      this.captions.set(true);
    } catch {
      this.captionError.set(true);
    }
  }
}
