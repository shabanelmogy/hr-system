import { Component, computed, inject } from '@angular/core';
import { DateField, OptionSelect, TextField } from '../../../../shared/ui/public-api';
import { ErrorLogPresentation } from '../../presentation/error-log-presentation';
import { ErrorLogReadState } from '../../state/error-log-read-state';
import type { ErrorLogSource } from '../../types/error-log';

@Component({
  imports: [DateField, OptionSelect, TextField],
  selector: 'erp-error-log-criteria',
  styleUrl: './error-log-criteria.scss',
  templateUrl: './error-log-criteria.html',
})
export class ErrorLogCriteria {
  readonly reads = inject(ErrorLogReadState);
  readonly captions = inject(ErrorLogPresentation);
  readonly sources = computed(() => [
    { value: '', label: this.captions.text('all') },
    ...(['api', 'job', 'web', 'mobile'] as const).map((value) => ({
      value,
      label: this.captions.text('sources.' + value),
    })),
  ]);
  readonly statuses = computed(() => [
    { value: '', label: this.captions.text('all') },
    ...[400, 401, 403, 404, 409, 413, 422, 429, 500, 502, 503, 504].map((value) => ({
      value: String(value),
      label: String(value),
    })),
  ]);
  readonly rangeErrors = computed(() =>
    this.reads.invalid() === 'range'
      ? [{ kind: 'server' as const, message: this.captions.text('invalidRange') }]
      : [],
  );
  readonly statusValue = computed(() => String(this.reads.filters().statusCode));
  source(value: string): void {
    const source = ['api', 'job', 'web', 'mobile'].find((source) => source === value);
    this.reads.patchFilters({ source: (source ?? '') as '' | ErrorLogSource });
  }
  status(value: string): void {
    this.reads.patchFilters({ statusCode: value === '' ? '' : Number(value) });
  }
}
