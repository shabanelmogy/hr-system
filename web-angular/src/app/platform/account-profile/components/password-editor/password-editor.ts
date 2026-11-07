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
  selector: 'erp-account-password-editor',
  imports: [ActionButton, FormContainer, FormField, TextField, UiTextPipe],
  templateUrl: './password-editor.html',
  styleUrl: './password-editor.scss',
})
export class PasswordEditor {
  readonly state = inject(AccountProfileState);
  private readonly locale = inject(LocalizationRuntime);
  readonly messages = computed<FieldMessages>(() => ({
    required: this.locale.translate('validation.required'),
    minlength: this.locale.translate('validation.minLength', 'core', { count: 8 }),
    maxlength: this.locale.translate('validation.maxLength', 'core', { count: 50 }),
    same: this.text('passwordMustDiffer'),
    policy: this.text('passwordPolicy'),
  }));
  text(key: string): string {
    return this.locale.translate('accountProfile.' + key, 'platform-auth');
  }
}
