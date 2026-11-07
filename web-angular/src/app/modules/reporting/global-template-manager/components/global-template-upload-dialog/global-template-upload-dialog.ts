import { Component, effect, inject, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  DialogPanel,
  FeedbackState,
  FileField,
  FormCloseGuard,
  FormContainer,
  OptionSelect,
  TextField,
} from '../../../../../shared/ui/public-api';
import { GlobalTemplateState } from '../../state/global-template-state';

@Component({
  imports: [
    ActionButton,
    AppIcon,
    DialogPanel,
    FeedbackState,
    FileField,
    FormCloseGuard,
    FormContainer,
    OptionSelect,
    ReactiveFormsModule,
    TextField,
    UiTextPipe,
  ],
  selector: 'erp-global-template-upload-dialog',
  templateUrl: './global-template-upload-dialog.html',
})
export class GlobalTemplateUploadDialog {
  readonly state = inject(GlobalTemplateState);
  readonly locale = inject(LocalizationRuntime);
  readonly entryForm = viewChild<FormContainer>('entryForm');
  readonly closeGuard = viewChild.required<FormCloseGuard>('closeGuard');
  readonly messages = () => ({
    required: this.locale.translate('crystalReports.validation.fileRequired', 'reporting'),
    invalidFile: this.locale.translate('crystalReports.fileHint', 'reporting'),
    maxlength: this.locale.translate('crystalReports.validation.descriptionLength', 'reporting'),
  });
  readonly entityOptions = () =>
    this.state.contracts().map((contract) => ({
      value: contract.entityKey,
      label: this.locale.translate('globalTemplates.entities.' + contract.entityKey, 'reporting'),
    }));
  readonly createEntityOptions = () =>
    this.entityOptions().filter((option) =>
      this.state
        .contracts()
        .some(
          (contract) =>
            contract.entityKey === option.value && this.state.canAt(contract.entityKey, 'Create'),
        ),
    );
  constructor() {
    effect(() => {
      const feedback = this.state.feedback();
      if (feedback && Object.keys(feedback.fields).length) this.entryForm()?.revealErrors();
    });
  }
  inspect(): void {
    if (this.state.form.invalid) {
      this.entryForm()?.revealErrors();
      return;
    }
    this.state.inspect();
  }
}
