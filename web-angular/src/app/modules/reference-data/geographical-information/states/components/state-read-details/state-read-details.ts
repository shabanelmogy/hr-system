import { Component, effect, input, output, signal } from '@angular/core';
import { form, FormField, readonly } from '@angular/forms/signals';
import { UiTextPipe } from '../../../../../../platform/localization/public-api';
import {
  ActionButton,
  FormContainer,
  StatusBadge,
  TextField,
} from '../../../../../../shared/ui/public-api';
import type { StateDetail } from '../../types/state';
@Component({
  selector: 'erp-state-read-details',
  imports: [FormField, FormContainer, TextField, ActionButton, StatusBadge, UiTextPipe],
  templateUrl: './state-read-details.html',
})
export class StateReadDetails {
  readonly state = input.required<StateDetail>();
  readonly closed = output<void>();
  readonly form = form(signal({ nameAr: '', nameEn: '', code: '', country: '' }), (path) =>
    readonly(path),
  );
  constructor() {
    effect(() => {
      const state = this.state();
      this.form().reset({
        nameAr: state.nameAr,
        nameEn: state.nameEn,
        code: state.code,
        country: state.country.nameEn,
      });
    });
  }
}
