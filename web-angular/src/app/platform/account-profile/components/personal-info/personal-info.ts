import { Component, computed, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import {
  ActionButton,
  FormContainer,
  TextField,
  type FieldMessages,
} from '../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { AccountProfileState } from '../../state/account-profile-state';

@Component({
  selector: 'erp-account-personal-info',
  imports: [ActionButton, FormContainer, FormField, TextField, UiTextPipe],
  templateUrl: './personal-info.html',
  styleUrl: './personal-info.scss',
})
export class PersonalInfo {
  readonly state = inject(AccountProfileState);
  private readonly locale = inject(LocalizationRuntime);
  readonly messages = computed<FieldMessages>(() => ({
    required: this.locale.translate('validation.required'),
    minlength: this.locale.translate('validation.minLength', 'core', { count: 3 }),
    maxlength: this.locale.translate('validation.maxLength', 'core', { count: 50 }),
  }));
  text(key: string): string {
    return this.locale.translate('accountProfile.' + key, 'platform-auth');
  }
}
