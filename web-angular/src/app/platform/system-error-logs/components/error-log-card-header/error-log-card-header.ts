import { Component, inject, input } from '@angular/core';
import { StatusBadge } from '../../../../shared/ui/public-api';
import { ErrorLogPresentation } from '../../presentation/error-log-presentation';
import type { ErrorLogRow } from '../../types/error-log';

@Component({
  imports: [StatusBadge],
  selector: 'erp-error-log-card-header',
  styleUrl: './error-log-card-header.scss',
  templateUrl: './error-log-card-header.html',
})
export class ErrorLogCardHeader {
  readonly entry = input.required<ErrorLogRow>();
  readonly captions = inject(ErrorLogPresentation);
}
