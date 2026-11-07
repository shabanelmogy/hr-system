import { Component, effect, inject, input, output, signal } from '@angular/core';
import { form, FormField, readonly } from '@angular/forms/signals';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import {
  ActionButton,
  FormContainer,
  StatusBadge,
  TextField,
} from '../../../../../../shared/ui/public-api';
import type { DistrictDetail } from '../../types/district';
@Component({
  selector: 'erp-district-read-details',
  imports: [FormField, FormContainer, TextField, ActionButton, StatusBadge, UiTextPipe],
  templateUrl: './district-read-details.html',
})
export class DistrictReadDetails {
  private readonly locale = inject(LocalizationRuntime);
  readonly state = input.required<DistrictDetail>();
  readonly closed = output<void>();
  readonly form = form(signal({ nameAr: '', nameEn: '', code: '', state: '' }), (path) =>
    readonly(path),
  );
  constructor() {
    effect(() => {
      const state = this.state();
      this.form().reset({
        nameAr: state.nameAr,
        nameEn: state.nameEn,
        code: state.code,
        state: this.locale.language() === 'ar' ? state.state.nameAr : state.state.nameEn,
      });
    });
  }
}
