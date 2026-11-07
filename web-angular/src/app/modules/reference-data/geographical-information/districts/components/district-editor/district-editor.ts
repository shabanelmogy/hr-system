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
import { DistrictEditorState, type DistrictSaved } from '../../state/district-editor-state';
import {
  districtFieldLimits,
  type DistrictMutationField,
} from '../../validation/district-mutation';
@Component({
  selector: 'erp-district-editor',
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
  templateUrl: './district-editor.html',
})
export class DistrictEditor {
  readonly state = inject(DistrictEditorState);
  readonly locale = inject(LocalizationRuntime);
  readonly fields: readonly DistrictMutationField[] = ['nameAr', 'nameEn', 'code', 'stateId'];
  readonly limits = districtFieldLimits;
  readonly saved = output<DistrictSaved>();
  readonly closeGuard = viewChild.required(FormCloseGuard);
  private readonly form = viewChild<FormContainer>('entryForm');
  readonly messages = computed(() => ({
    nameAr: this.message('invalidCode', 100),
    nameEn: this.message('invalidCode', 100),
    code: this.message('invalidCode', 10),
    stateId: {
      required: this.locale.translate('validation.required'),
      parentUnavailable: this.locale.translate('districts.stateUnavailable', 'reference-districts'),
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
      pattern: this.locale.translate('districts.' + key, 'reference-districts'),
    };
  }
  label(field: DistrictMutationField) {
    return field === 'nameAr' || field === 'nameEn'
      ? this.locale.translate('general.' + field)
      : this.locale.translate(
          'districts.' + (field === 'stateId' ? 'state' : field),
          'reference-districts',
        );
  }
}
