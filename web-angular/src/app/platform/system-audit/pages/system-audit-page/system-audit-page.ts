import { Component, inject, signal, computed, viewChild } from '@angular/core';
import { PageHeader, FeedbackState } from '../../../../shared/ui/public-api';
import { AuditPresentation } from '../../presentation/audit-presentation';
import { AuditReadState } from '../../state/audit-read-state';
import { AuditFilterState } from '../../state/audit-filter-state';
import { AuditDetailState } from '../../state/audit-detail-state';
import { AuditCollection } from '../../components/audit-collection/audit-collection';
import { AuditDetails } from '../../components/audit-details/audit-details';

@Component({
  selector: 'erp-system-audit-page',
  providers: [AuditPresentation, AuditReadState, AuditFilterState, AuditDetailState],
  imports: [PageHeader, FeedbackState, AuditCollection, AuditDetails],
  templateUrl: './system-audit-page.html',
  styleUrl: './system-audit-page.scss',
})
export class SystemAuditPage {
  readonly reads = inject(AuditReadState);
  private readonly collection = viewChild(AuditCollection);
  readonly exportSource = computed(() =>
    this.reads.exportSource(this.collection()?.columns() ?? [], this.captions.locale.language()),
  );
  readonly options = inject(AuditFilterState);
  readonly captions = inject(AuditPresentation);
  readonly showFilters = signal(false);
  readonly views = computed(() => [
    { id: 'grid', label: this.captions.locale.translate('views.grid'), icon: 'grid' as const },
  ]);
  refresh(): void {
    this.reads.refresh();
    this.options.refresh();
  }
}
