import { Component, computed, inject } from '@angular/core';
import { DateField, OptionSelect } from '../../../../shared/ui/public-api';
import { AuditReadState } from '../../state/audit-read-state';
import { AuditFilterState } from '../../state/audit-filter-state';
import { AuditPresentation } from '../../presentation/audit-presentation';
import { auditActions } from '../../types/audit-trail';

@Component({
  selector: 'erp-audit-criteria',
  imports: [DateField, OptionSelect],
  templateUrl: './audit-criteria.html',
  styleUrl: './audit-criteria.scss',
})
export class AuditCriteria {
  readonly reads = inject(AuditReadState);
  readonly options = inject(AuditFilterState);
  readonly captions = inject(AuditPresentation);
  readonly modules = computed(() => [
    { value: '', label: this.captions.text('all') },
    ...this.options.modules().map((module) => ({
      value: module.moduleCode,
      label: this.captions.label('modules', module.moduleCode),
    })),
  ]);
  readonly entities = computed(() => {
    const selected = this.reads.filters().moduleCode;
    const names = [
      ...new Set(
        this.options
          .modules()
          .filter((module) => !selected || module.moduleCode === selected)
          .flatMap((module) => module.entityNames),
      ),
    ].sort();
    return [
      { value: '', label: this.captions.text('all') },
      ...names.map((name) => ({ value: name, label: this.captions.label('entities', name) })),
    ];
  });
  readonly actions = computed(() => [
    { value: '', label: this.captions.text('all') },
    ...auditActions.map((action) => ({
      value: action,
      label: this.captions.text('actions.' + action),
    })),
  ]);
  readonly rangeErrors = computed(() =>
    this.reads.invalid() === 'range'
      ? [
          {
            kind: 'server',
            message: this.captions.locale.translate(
              'errorLogs.invalidRange',
              'platform-advanced-tools',
            ),
          },
        ]
      : [],
  );
  action(value: string): void {
    const action = auditActions.find((action) => action === value);
    if (action || value === '') this.reads.patchFilters({ action: action ?? '' });
  }
}
