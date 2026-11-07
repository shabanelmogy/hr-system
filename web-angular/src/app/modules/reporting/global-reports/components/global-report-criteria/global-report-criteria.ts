import { Component, input, output } from '@angular/core';
import { FormField, type FieldTree } from '@angular/forms/signals';
import { UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  FormContainer,
  OptionSelect,
  ReferenceField,
  TextField,
  type FieldMessages,
  type ReferenceId,
  type ReferenceSource,
} from '../../../../../shared/ui/public-api';
import type { GlobalReport, GlobalReportEntity, ReportFilterForm } from '../../types/global-report';

@Component({
  selector: 'erp-global-report-criteria',
  imports: [
    FormField,
    ActionButton,
    AppIcon,
    FormContainer,
    OptionSelect,
    ReferenceField,
    TextField,
    UiTextPipe,
  ],
  templateUrl: './global-report-criteria.html',
})
export class GlobalReportCriteria {
  readonly form = input.required<FieldTree<ReportFilterForm>>();
  readonly entity = input.required<GlobalReportEntity>();
  readonly chooseEntity = input(false);
  readonly entityOptions =
    input.required<readonly { readonly value: GlobalReportEntity; readonly label: string }[]>();
  readonly selected = input.required<GlobalReport | null>();
  readonly source = input.required<ReferenceSource>();
  readonly messages = input.required<FieldMessages>();
  readonly pending = input(false);
  readonly conflict = input(false);
  readonly entityChange = output<string>();
  readonly reportChange = output<ReferenceId | null>();
  readonly resetRequested = output<void>();
}
