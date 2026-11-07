import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface RecordSummaryField {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly fullWidth?: boolean;
  readonly direction?: 'auto' | 'ltr' | 'rtl';
}

@Component({
  imports: [],
  selector: 'erp-record-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './record-summary.scss',
  templateUrl: './record-summary.html',
  host: { '[class.compact]': "density() === 'compact'" },
})
export class RecordSummary {
  readonly title = input.required<string>();
  readonly density = input<'standard' | 'compact'>('standard');
  readonly description = input<string | null>(null);
  readonly metadata = input<string | null>(null);
  readonly fields = input<readonly RecordSummaryField[]>([]);
}
