import { Component, computed, inject, input } from '@angular/core';
import { LocalizationRuntime } from '../../../localization/public-api';
import {
  MyDataGrid,
  StatusBadge,
  CollectionCell,
  CollectionColumnPipe,
  createLocalCollection,
  type CollectionColumn,
} from '../../../../shared/ui/public-api';
import type { HealthEntry, HealthReport, HealthStatus } from '../../types/operational-report';

@Component({
  selector: 'erp-health-report-panel',
  imports: [MyDataGrid, StatusBadge, CollectionCell, CollectionColumnPipe],
  templateUrl: './health-report-panel.html',
  styleUrl: './health-report-panel.scss',
})
export class HealthReportPanel {
  readonly report = input.required<HealthReport>();
  readonly locale = inject(LocalizationRuntime);
  readonly rows = computed(() => this.report().entries);
  readonly collection = createLocalCollection({
    rows: this.rows,
    scopeKey: () => 'system-health',
    pageSizes: [10, 25, 50, 100],
    sortValues: { name: (row: HealthEntry) => row.name },
  });
  readonly id = (entry: HealthEntry) => entry.name;
  readonly columns = computed<readonly CollectionColumn<HealthEntry>[]>(() => [
    {
      key: 'name',
      header: this.text('component'),
      value: (row) => row.name,
      minWidth: 200,
      flex: 1,
    },
    {
      key: 'status',
      header: this.text('status'),
      value: (row) => this.statusLabel(row.status),
      width: 130,
    },
    { key: 'duration', header: this.text('duration'), value: (row) => row.duration, width: 160 },
    {
      key: 'description',
      header: this.text('details'),
      value: (row) => row.description ?? this.text('noIssuesReported'),
      minWidth: 250,
      flex: 2,
    },
  ]);
  text(key: string): string {
    return this.locale.translate('healthCheck.' + key, 'platform-advanced-tools');
  }
  statusLabel(status: HealthStatus): string {
    return this.text('statuses.' + status.toLowerCase());
  }
  accent(status: HealthStatus): string {
    return status === 'Healthy'
      ? 'var(--success)'
      : status === 'Unhealthy'
        ? 'var(--destructive)'
        : 'var(--warning)';
  }
}
