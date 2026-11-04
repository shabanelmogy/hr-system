import { Component, computed, input } from '@angular/core';
import { ProgressBar } from 'primeng/progressbar';

export function progressPercentage(used: number, limit: number): number {
  return Number.isFinite(used) && Number.isFinite(limit) && limit > 0
    ? Math.max(0, Math.min(100, Math.round((used / limit) * 100)))
    : 0;
}
@Component({
  selector: 'erp-progress-meter',
  imports: [ProgressBar],
  templateUrl: './progress-meter.html',
  styleUrl: './progress-meter.scss',
})
export class ProgressMeter {
  readonly label = input.required<string>();
  readonly description = input.required<string>();
  readonly used = input.required<number>();
  readonly limit = input.required<number>();
  readonly accent = input<string | null>(null);
  readonly appearance = input<'panel' | 'inline'>('panel');
  readonly percentage = computed(() => progressPercentage(this.used(), this.limit()));
  readonly tokens = computed(() => ({
    root: {
      height: this.appearance() === 'inline' ? '6px' : '7px',
      borderRadius: '999px',
      background:
        this.appearance() === 'inline'
          ? 'color-mix(in srgb,' + (this.accent() ?? 'var(--primary)') + ' 18%,transparent)'
          : 'var(--muted)',
    },
    value: {
      background: this.accent() ?? (this.percentage() >= 90 ? 'var(--warning)' : 'var(--primary)'),
    },
  }));
}
