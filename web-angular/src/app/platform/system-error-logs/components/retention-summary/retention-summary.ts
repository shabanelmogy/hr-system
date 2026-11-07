import { Component, computed, inject } from '@angular/core';
import { ActionButton, MetricCard, type AppIconName } from '../../../../shared/ui/public-api';
import { ErrorLogSettingsState } from '../../state/error-log-settings-state';
import { RetentionEditorState } from '../../state/retention-editor-state';
import { RetentionPresentation } from '../../presentation/retention-presentation';

@Component({
  selector: 'erp-retention-summary',
  imports: [ActionButton, MetricCard],
  templateUrl: './retention-summary.html',
  styleUrl: './retention-summary.scss',
})
export class RetentionSummary {
  readonly reads = inject(ErrorLogSettingsState);
  readonly editor = inject(RetentionEditorState);
  readonly captions = inject(RetentionPresentation);
  readonly settings = computed(() => {
    const view = this.reads.view();
    return view.kind === 'ready' ? view.data : null;
  });
  readonly counters = computed(() => {
    const data = this.settings();
    if (!data) return [];
    const entries: readonly {
      key: 'revision' | 'queueDepth' | 'droppedCount' | 'failedWrites';
      icon: AppIconName;
      accent: string;
    }[] = [
      { key: 'revision', icon: 'history', accent: 'var(--info)' },
      { key: 'queueDepth', icon: 'dataset', accent: 'var(--primary)' },
      {
        key: 'droppedCount',
        icon: 'assessment',
        accent: data.droppedCount > 0 ? 'var(--warning)' : 'var(--success)',
      },
      {
        key: 'failedWrites',
        icon: 'dataset',
        accent: data.failedWrites > 0 ? 'var(--destructive)' : 'var(--success)',
      },
    ];
    return entries.map((entry) => ({
      ...entry,
      label: this.captions.text(entry.key),
      value: this.captions.numeric(data[entry.key]),
    }));
  });
}
