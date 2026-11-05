import { Component, input, output } from '@angular/core';
import { UiTextPipe } from '../../../localization/public-api';

export interface ValidationIssue {
  readonly id: string;
  readonly label: string;
  readonly message: string;
}

/** Presentation only: the shared form remains responsible for validation and focus. */
@Component({
  selector: 'erp-validation-summary',
  imports: [UiTextPipe],
  templateUrl: './validation-summary.html',
  styleUrl: './validation-summary.scss',
})
export class ValidationSummary {
  readonly issues = input.required<readonly ValidationIssue[]>();
  readonly issueSelected = output<string>();

  select(event: Event, id: string): void {
    event.preventDefault();
    this.issueSelected.emit(id);
  }
}
