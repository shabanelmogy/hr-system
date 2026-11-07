import { Component, computed, inject } from '@angular/core';
import { MetricCard, StatusBadge, SurfaceCard } from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import { TenantEditorState } from '../../state/tenant-editor-state';

@Component({
  imports: [MetricCard, StatusBadge, SurfaceCard, UiTextPipe],
  selector: 'erp-tenant-draft-summary',
  styleUrl: './tenant-draft-summary.scss',
  templateUrl: './tenant-draft-summary.html',
})
export class TenantDraftSummary {
  readonly editor = inject(TenantEditorState);
  readonly locale = inject(LocalizationRuntime);
  readonly draft = computed(() => this.editor.form().value());
  readonly metrics = computed(() => {
    const draft = this.draft(),
      number = new Intl.NumberFormat(this.locale.language());
    return [
      { id: 'admins', value: draft.maxAdmins.trim() || '—', icon: 'admin' as const },
      { id: 'users', value: draft.maxUsers.trim() || '—', icon: 'user' as const },
      {
        id: 'selectedModules',
        value: number.format(draft.entitlements.length),
        icon: 'grid' as const,
      },
      {
        id: 'selectedAreas',
        value: number.format(
          draft.entitlements.reduce((count, entry) => count + entry.submoduleCodes.length, 0),
        ),
        icon: 'groups' as const,
      },
    ];
  });
}
