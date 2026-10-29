import { Component, input, output } from '@angular/core';
import { UiTextPipe } from '../../../platform/localization/public-api';

export interface ValidationIssue {
  readonly id: string;
  readonly label: string;
  readonly message: string;
}

/** Presentation only: the shared form remains responsible for validation and focus. */
@Component({
  selector: 'erp-validation-summary',
  imports: [UiTextPipe],
  template: `
    @if (issues().length) {
      <section class="error-summary" role="alert"
        [attr.aria-label]="'common.reviewValidationErrors' | uiText:'core':{count: issues().length}">
        <div class="summary-heading">
          <span class="error-count" aria-hidden="true">{{ issues().length }}</span>
          <p>{{ 'common.validationErrors' | uiText }}</p>
        </div>
        <ul class="error-badges">
          @for (issue of issues(); track issue.id) {
            <li><a class="error-badge" [href]="'#' + issue.id" (click)="select($event, issue.id)">
              <span class="field-name">{{ issue.label }}</span>
              <span class="badge-separator" aria-hidden="true"></span>
              <span class="field-message">{{ issue.message }}</span>
            </a></li>
          }
        </ul>
      </section>
    }
  `,
  styleUrl: './validation-summary.scss',
})
export class ValidationSummary {
  readonly issues = input.required<readonly ValidationIssue[]>();
  readonly issueSelected = output<string>();

  select(event: Event, id: string): void {
    event.preventDefault(); this.issueSelected.emit(id);
  }
}
