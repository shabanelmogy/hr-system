import { Component, computed, inject, output, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormField } from '@angular/forms/signals';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  DialogPanel,
  FeedbackState,
  FormCloseGuard,
  FormContainer,
  ReferenceField,
  TextField,
  type FieldMessages,
} from '../../../../../../shared/ui/public-api';
import { StateEditorState, type StateSaved } from '../../state/state-editor-state';
import { stateFieldLimits, type StateMutationField } from '../../validation/state-mutation';
@Component({
  selector: 'erp-state-editor',
  imports: [
    FormField,
    ActionButton,
    AppIcon,
    DialogPanel,
    FeedbackState,
    FormCloseGuard,
    FormContainer,
    ReferenceField,
    TextField,
    UiTextPipe,
  ],
  templateUrl: './state-editor.html',
})
export class StateEditor {
  readonly state = inject(StateEditorState);
  readonly locale = inject(LocalizationRuntime);
  readonly fields: readonly StateMutationField[] = ['nameAr', 'nameEn', 'code', 'countryId'];
  readonly limits = stateFieldLimits;
  readonly saved = output<StateSaved>();
  readonly closeGuard = viewChild.required(FormCloseGuard);
  private readonly form = viewChild<FormContainer>('entryForm');
  readonly messages = computed(() => ({
    nameAr: this.message('invalidCode', 100),
    nameEn: this.message('invalidCode', 100),
    code: this.message('invalidCode', 10),
    countryId: {
      required: this.locale.translate('validation.required'),
      parentUnavailable: this.locale.translate('states.countryUnavailable', 'reference-states'),
    },
  }));
  constructor() {
    this.state.saved.pipe(takeUntilDestroyed()).subscribe((value) => this.saved.emit(value));
    this.state.errorsChanged
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form()?.revealErrors());
  }
  private message(key: string, maximum: number): FieldMessages {
    return {
      required: this.locale.translate('validation.required'),
      minlength: this.locale.translate('validation.minLength', 'core', { count: 2 }),
      maxlength: this.locale.translate('validation.maxLength', 'core', { count: maximum }),
      invalidText: this.locale.translate('validation.invalidText'),
      pattern: this.locale.translate('states.' + key, 'reference-states'),
    };
  }
  label(field: StateMutationField) {
    return field === 'nameAr' || field === 'nameEn'
      ? this.locale.translate('general.' + field)
      : this.locale.translate('states.' + field, 'reference-states');
  }
}
