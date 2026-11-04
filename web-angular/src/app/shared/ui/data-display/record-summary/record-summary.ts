import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  imports: [],
  selector: 'erp-record-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './record-summary.scss',
  templateUrl: './record-summary.html',
})
export class RecordSummary {
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly metadata = input<string | null>(null);
}
